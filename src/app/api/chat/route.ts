// AC-T7-2 / AC-T7-3 / AC-T7-4 / AC-T7-6
//
// Same-origin serverless proxy for the portfolio chat bot. The browser widget
// talks ONLY to this route; the bot URL + secret never leave the server, so
// they can never end up in a client bundle.
//
// Env (SERVER-SIDE ONLY — never NEXT_PUBLIC_):
//   PORTFOLIO_BOT_URL           e.g. https://bot.example.test  (no trailing slash)
//   PORTFOLIO_BOT_SECRET        bearer token forwarded in the Authorization header
//   PORTFOLIO_ALLOWED_ORIGINS   comma-separated allowlist of Origin/Referer values
//                               (default: 'https://fiez.dev,http://localhost:3000')
//
// Hardening notes:
//   - Origin/Referer allowlist (CSRF surface reduction): non-empty Origin OR
//     Referer must be in the allowlist, otherwise 403.
//   - Message length cap: 4000 chars max -> 400 ('message_too_long').
//   - Per-IP in-memory token-bucket rate limit (burst cap). This is a
//     best-effort guard for a low-traffic concierge route. The REAL fix for
//     abusive traffic is Vercel Firewall / edge rate-limiting (paid feature),
//     applied at the edge before this function runs. The in-memory bucket is
//     per server instance and resets on cold start.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// --- Hardening constants -------------------------------------------------
const MAX_MESSAGE_LENGTH = 4000;

// Per-IP token bucket: refills continuously at RATE tokens/sec, caps at BURST.
// 5 requests / 15s window per IP — generous for a human, tight for a scraper.
const RATE_LIMIT_BURST = 5;
const RATE_LIMIT_RATE_PER_MS = 5 / 15_000; // tokens per ms

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  // Defense in depth: prevent MIME-sniffing + never cache the answer.
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store',
} as const;

// --- Origin allowlist ----------------------------------------------------
function getAllowedOrigins(): string[] {
  const raw = process.env.PORTFOLIO_ALLOWED_ORIGINS;
  const defaulted =
    raw && raw.trim().length > 0
      ? raw
      : 'https://fiez.dev,http://localhost:3000';
  return defaulted
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function originAllowed(req: Request): boolean {
  const allow = getAllowedOrigins();
  const origin = req.headers.get('Origin');
  const referer = req.headers.get('Referer');
  if (origin) return allow.includes(origin);
  if (referer) {
    try {
      const u = new URL(referer);
      return allow.includes(`${u.protocol}//${u.host}`);
    } catch {
      return false;
    }
  }
  // No Origin AND no Referer: treat as disallowed (browsers always send one
  // of these on cross-origin or same-origin CORS/fetch POSTs).
  return false;
}

// --- Per-IP token bucket (in-memory, per-instance) -----------------------
interface Bucket {
  tokens: number;
  last: number;
}
const buckets = new Map<string, Bucket>();

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b) {
    buckets.set(ip, { tokens: RATE_LIMIT_BURST - 1, last: now });
    return true;
  }
  const elapsed = now - b.last;
  const refilled = Math.min(
    RATE_LIMIT_BURST,
    b.tokens + elapsed * RATE_LIMIT_RATE_PER_MS,
  );
  if (refilled < 1) {
    b.tokens = refilled;
    b.last = now;
    return false;
  }
  b.tokens = refilled - 1;
  b.last = now;
  return true;
}

// For tests: reset the bucket state between cases.
export function __resetRateLimit(): void {
  buckets.clear();
}

// AC-T11-6: a UUID v4 correlation id propagated widget→here→bot→line-gate so a
// single sendback can be traced across every service's logs. crypto.randomUUID
// is available in the Node 18+ runtime.
function uuid(): string {
  const c = globalThis.crypto as { randomUUID?: () => string } | undefined;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  // Should not happen on a supported runtime, but keep a safe fallback.
  return '00000000-0000-4000-8000-000000000000';
}

const CORRELATION_HEADER = 'X-Correlation-Id';

function bad(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: JSON_HEADERS,
  });
}

function tooManyRequests(): Response {
  return new Response(
    JSON.stringify({ error: 'rate_limited' }),
    { status: 429, headers: JSON_HEADERS },
  );
}

function forbidden(): Response {
  return new Response(
    JSON.stringify({ error: 'origin_not_allowed' }),
    { status: 403, headers: JSON_HEADERS },
  );
}

// Distinguish bot-not-configured (missing env) from bot-unreachable
// (network failure or upstream 5xx). The two are different failure modes:
// the first is an operator config error, the second is a transient outage.
function serverUnavailable(
  status: number,
  kind: 'bot_not_configured' | 'bot_unreachable' = 'bot_not_configured',
): Response {
  return new Response(JSON.stringify({ status: 'unavailable', error: kind }), {
    status,
    headers: JSON_HEADERS,
  });
}

// ---------------------------------------------------------------------------
// POST /api/chat
// Body: { message, mode?, sessionId?, client_request_id }
// AC-T7-2, AC-T7-6: forwards to ${BOT_URL}/chat/request with Bearer secret +
// the client_request_id (the bot dedupes retries on this id).
// ---------------------------------------------------------------------------
export async function POST(req: Request): Promise<Response> {
  // 1. Origin allowlist (cheap pre-flight; fail fast on CSRF-style abuse).
  if (!originAllowed(req)) return forbidden();
  // 2. Per-IP rate limit.
  if (!rateLimit(clientIp(req))) return tooManyRequests();

  const botUrl = process.env.PORTFOLIO_BOT_URL;
  const botSecret = process.env.PORTFOLIO_BOT_SECRET;
  if (!botUrl || !botSecret) {
    return serverUnavailable(503, 'bot_not_configured');
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad('invalid_json');
  }

  const { message, mode, client_request_id } = (body ?? {}) as {
    message?: unknown;
    mode?: unknown;
    client_request_id?: unknown;
  };

  if (typeof message !== 'string' || message.trim().length === 0) {
    return bad('message_required');
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return bad('message_too_long');
  }
  if (
    typeof client_request_id !== 'string' ||
    client_request_id.length === 0
  ) {
    return bad('missing_client_request_id');
  }

  // Bot contract: POST /session {email, mode} → {id,…}; POST /chat/request
  // {session_id, question} → {id, status, note}. The widget is anonymous, so
  // synthesize a stable visitor email per client_request_id (retries reuse the
  // same session). The bot's mode vocabulary is 'personal' | 'samkok' (samkok
  // == 3kok); map the widget's term.
  const visitorEmail = `visitor+${client_request_id}@portfolio.local`;
  const botMode = mode === '3kok' ? 'samkok' : 'personal';

  // AC-T11-6: forward the incoming correlation id, or mint one if the widget
  // didn't send it — so the trace never breaks at this hop.
  const correlationId = req.headers.get(CORRELATION_HEADER) || uuid();
  const base = botUrl.replace(/\/$/, '');
  const authHeaders: Record<string, string> = {
    ...JSON_HEADERS,
    Authorization: `Bearer ${botSecret}`,
    [CORRELATION_HEADER]: correlationId,
  };

  // 1. Create a chat session for this visitor.
  let sessionRes: Response;
  try {
    sessionRes = await fetch(`${base}/session`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ email: visitorEmail, mode: botMode }),
      cache: 'no-store',
    });
  } catch {
    return serverUnavailable(502, 'bot_unreachable');
  }
  if (sessionRes.status >= 500) return serverUnavailable(sessionRes.status, 'bot_unreachable');
  if (!sessionRes.ok) {
    return new Response(
      JSON.stringify({ status: 'error', upstreamStatus: sessionRes.status, stage: 'session' }),
      { status: sessionRes.status, headers: JSON_HEADERS },
    );
  }
  const sessionBody = (await sessionRes.json().catch(() => ({}))) as { id?: string };
  const sessionId = sessionBody.id;
  if (!sessionId) return bad('bot_session_no_id', 502);

  // 2. Gated sendback: POST /chat/request {session_id, question}.
  let upstream: Response;
  try {
    upstream = await fetch(`${base}/chat/request`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ session_id: sessionId, question: message }),
      cache: 'no-store',
    });
  } catch {
    return serverUnavailable(502, 'bot_unreachable');
  }

  if (upstream.status === 202 || upstream.status === 200) {
    const obj = (await upstream.json().catch(() => ({}))) as { id?: string; status?: string };
    const pendingId = typeof obj.id === 'string' ? obj.id : undefined;
    return new Response(
      JSON.stringify({
        pendingId,
        sessionId,
        status: typeof obj.status === 'string' ? obj.status : 'pending',
      }),
      { status: 202, headers: JSON_HEADERS },
    );
  }
  if (upstream.status >= 500) return serverUnavailable(upstream.status, 'bot_unreachable');
  return new Response(
    JSON.stringify({ status: 'error', upstreamStatus: upstream.status, stage: 'sendback' }),
    { status: upstream.status, headers: JSON_HEADERS },
  );
}

// ---------------------------------------------------------------------------
// GET /api/chat?pendingId=…
// AC-T7-3: forwards to ${BOT_URL}/pending/{pendingId} and maps `answered`.
// ---------------------------------------------------------------------------
export async function GET(req: Request): Promise<Response> {
  // Same Origin allowlist as POST — both are browser-driven.
  if (!originAllowed(req)) return forbidden();
  if (!rateLimit(clientIp(req))) return tooManyRequests();

  const botUrl = process.env.PORTFOLIO_BOT_URL;
  const botSecret = process.env.PORTFOLIO_BOT_SECRET;
  if (!botUrl || !botSecret) {
    return serverUnavailable(503, 'bot_not_configured');
  }

  const { searchParams } = new URL(req.url);
  const pendingId = searchParams.get('pendingId');
  if (!pendingId) {
    return bad('missing_pendingId');
  }

  // AC-T11-6: same forward-or-mint as POST — a poll is part of the same sendback.
  const correlationId = req.headers.get(CORRELATION_HEADER) || uuid();

  let upstream: Response;
  try {
    upstream = await fetch(
      `${botUrl.replace(/\/$/, '')}/pending/${encodeURIComponent(pendingId)}`,
      {
        method: 'GET',
        headers: {
          ...JSON_HEADERS,
          Authorization: `Bearer ${botSecret}`,
          [CORRELATION_HEADER]: correlationId,
        },
        cache: 'no-store',
      },
    );
  } catch {
    return serverUnavailable(502, 'bot_unreachable');
  }

  if (upstream.status === 404) {
    return new Response(JSON.stringify({ status: 'not_found' }), {
      status: 404,
      headers: JSON_HEADERS,
    });
  }
  if (!upstream.ok) {
    if (upstream.status >= 500) {
      return serverUnavailable(upstream.status, 'bot_unreachable');
    }
    return new Response(
      JSON.stringify({ status: 'error', upstreamStatus: upstream.status }),
      { status: upstream.status, headers: JSON_HEADERS },
    );
  }

  const text = await upstream.text();
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = {};
  }
  // Allowlist fields: do NOT pass through arbitrary bot response keys.
  const obj = (parsed ?? {}) as {
    status?: unknown;
    answer?: unknown;
    sources?: unknown;
  };
  const out: Record<string, unknown> = {
    status: typeof obj.status === 'string' ? obj.status : 'pending',
  };
  if (typeof obj.answer === 'string') out.answer = obj.answer;
  if (Array.isArray(obj.sources)) out.sources = obj.sources;
  return new Response(JSON.stringify(out), {
    status: 200,
    headers: JSON_HEADERS,
  });
}
