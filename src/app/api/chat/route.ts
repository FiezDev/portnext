// AC-T7-2 / AC-T7-3 / AC-T7-4 / AC-T7-6
//
// Same-origin serverless proxy for the portfolio chat bot. The browser widget
// talks ONLY to this route; the bot URL + secret never leave the server, so
// they can never end up in a client bundle.
//
// Env (SERVER-SIDE ONLY — never NEXT_PUBLIC_):
//   PORTFOLIO_BOT_URL    e.g. https://bot.example.test  (no trailing slash)
//   PORTFOLIO_BOT_SECRET bearer token forwarded in the Authorization header

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

function bad(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: JSON_HEADERS,
  });
}

function serverUnavailable(status: number): Response {
  return new Response(
    JSON.stringify({ status: 'unavailable', error: 'bot_not_configured' }),
    { status, headers: JSON_HEADERS },
  );
}

// ---------------------------------------------------------------------------
// POST /api/chat
// Body: { message, mode?, sessionId?, client_request_id }
// AC-T7-2, AC-T7-6: forwards to ${BOT_URL}/chat/request with Bearer secret +
// the client_request_id (the bot dedupes retries on this id).
// ---------------------------------------------------------------------------
export async function POST(req: Request): Promise<Response> {
  const botUrl = process.env.PORTFOLIO_BOT_URL;
  const botSecret = process.env.PORTFOLIO_BOT_SECRET;
  if (!botUrl || !botSecret) {
    return serverUnavailable(503);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad('invalid_json');
  }

  const { message, mode, sessionId, client_request_id } = (body ?? {}) as {
    message?: unknown;
    mode?: unknown;
    sessionId?: unknown;
    client_request_id?: unknown;
  };

  if (typeof message !== 'string' || message.trim().length === 0) {
    return bad('missing_message');
  }
  if (
    typeof client_request_id !== 'string' ||
    client_request_id.length === 0
  ) {
    return bad('missing_client_request_id');
  }

  const forwardPayload: Record<string, unknown> = {
    message,
    client_request_id,
  };
  if (typeof mode === 'string') forwardPayload.mode = mode;
  if (typeof sessionId === 'string') forwardPayload.sessionId = sessionId;

  let upstream: Response;
  try {
    upstream = await fetch(`${botUrl.replace(/\/$/, '')}/chat/request`, {
      method: 'POST',
      headers: {
        ...JSON_HEADERS,
        Authorization: `Bearer ${botSecret}`,
      },
      body: JSON.stringify(forwardPayload),
      cache: 'no-store',
    });
  } catch {
    return serverUnavailable(502);
  }

  // Passthrough for the two success states the widget expects.
  if (upstream.status === 202 || upstream.status === 200) {
    const text = await upstream.text();
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }
    const obj = (parsed ?? {}) as { pendingId?: unknown; status?: unknown };
    const pendingId =
      typeof obj.pendingId === 'string' ? obj.pendingId : undefined;
    return new Response(
      JSON.stringify({
        pendingId,
        status: typeof obj.status === 'string' ? obj.status : 'pending',
      }),
      { status: 202, headers: JSON_HEADERS },
    );
  }

  // 4xx/5xx from the bot: pass through a structured error.
  return new Response(
    JSON.stringify({ status: 'error', upstreamStatus: upstream.status }),
    { status: upstream.status, headers: JSON_HEADERS },
  );
}

// ---------------------------------------------------------------------------
// GET /api/chat?pendingId=…
// AC-T7-3: forwards to ${BOT_URL}/pending/{pendingId} and maps `answered`.
// ---------------------------------------------------------------------------
export async function GET(req: Request): Promise<Response> {
  const botUrl = process.env.PORTFOLIO_BOT_URL;
  const botSecret = process.env.PORTFOLIO_BOT_SECRET;
  if (!botUrl || !botSecret) {
    return serverUnavailable(503);
  }

  const { searchParams } = new URL(req.url);
  const pendingId = searchParams.get('pendingId');
  if (!pendingId) {
    return bad('missing_pendingId');
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `${botUrl.replace(/\/$/, '')}/pending/${encodeURIComponent(pendingId)}`,
      {
        method: 'GET',
        headers: {
          ...JSON_HEADERS,
          Authorization: `Bearer ${botSecret}`,
        },
        cache: 'no-store',
      },
    );
  } catch {
    return serverUnavailable(502);
  }

  if (upstream.status === 404) {
    return new Response(JSON.stringify({ status: 'not_found' }), {
      status: 404,
      headers: JSON_HEADERS,
    });
  }
  if (!upstream.ok) {
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
  // Surface {status, answer?, sources?} to the widget.
  return new Response(JSON.stringify(parsed), {
    status: 200,
    headers: JSON_HEADERS,
  });
}
