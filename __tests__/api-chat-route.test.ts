/**
 * @jest-environment node
 */
import '@testing-library/jest-dom';

// We import the route handlers directly. route.ts exports POST + GET.
import { POST, GET, __resetRateLimit } from '@/app/api/chat/route';

// --- Fetch mock ----------------------------------------------------------
type FetchImpl = typeof fetch;
let fetchMock: jest.Mock<ReturnType<FetchImpl>, Parameters<FetchImpl>>;

const ALLOWED_ORIGIN = 'https://fiez.dev';

beforeEach(() => {
  fetchMock = jest.fn() as unknown as jest.Mock<
    ReturnType<FetchImpl>,
    Parameters<FetchImpl>
  >;
  (globalThis as { fetch: FetchImpl }).fetch = fetchMock;

  // SERVER-SIDE env. Must NEVER be NEXT_PUBLIC_.
  process.env.PORTFOLIO_BOT_URL = 'https://bot.example.test';
  process.env.PORTFOLIO_BOT_SECRET = 'super-secret-token';
  // Tests run with the production allowlist origin.
  process.env.PORTFOLIO_ALLOWED_ORIGINS = ALLOWED_ORIGIN;
  __resetRateLimit();
});

afterEach(() => {
  delete process.env.PORTFOLIO_BOT_URL;
  delete process.env.PORTFOLIO_BOT_SECRET;
  delete process.env.PORTFOLIO_ALLOWED_ORIGINS;
});

function jsonRes(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// The route makes TWO bot calls per POST: /session (bot replies {id}) and then
// /chat/request (bot replies {id, status}). Mock both, keyed on URL, and hand
// back a FRESH Response per call — a Response body can only be read once.
function mockBot(
  sendback: Record<string, unknown> = { id: 'pend-123', status: 'pending' },
  sendbackStatus = 202,
): void {
  fetchMock.mockImplementation((url: Parameters<FetchImpl>[0]) =>
    Promise.resolve(
      String(url).endsWith('/session')
        ? jsonRes({ id: 'sess-1' }, 200)
        : jsonRes(sendback, sendbackStatus),
    ),
  );
}

// Helper: a POST request that looks same-origin to the allowlist.
function allowedPost(
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
): Request {
  return new Request('https://fiez.dev/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: ALLOWED_ORIGIN,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function allowedGet(headers: Record<string, string> = {}): Request {
  return new Request('https://fiez.dev/api/chat?pendingId=pend-1', {
    method: 'GET',
    headers: { Origin: ALLOWED_ORIGIN, ...headers },
  });
}

// --------------------------------------------------------------------------
// AC-T7-2: POST forwards to PORTFOLIO_BOT_URL/chat/request with Bearer secret
// AC-T7-6: forwards client_request_id (bot dedupes)
// --------------------------------------------------------------------------
describe('AC-T7-2 / AC-T7-6 POST /api/chat', () => {
  it('forwards the message to the bot with Bearer secret + client_request_id and returns pendingId', async () => {
    mockBot();

    const req = allowedPost({
      message: 'hello',
      mode: '3kok',
      client_request_id: '11111111-2222-3333-4444-555555555555',
    });
    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(202);
    const json = await res.json();
    expect(json).toEqual({
      pendingId: 'pend-123',
      sessionId: 'sess-1',
      status: 'pending',
    });

    // Hop 1: /session, visitor email derived from client_request_id so a
    // retried POST reuses the same session. Hop 2: the gated sendback.
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [sessionUrl, sessionInit] = fetchMock.mock.calls[0];
    expect(String(sessionUrl)).toBe('https://bot.example.test/session');
    const sessionBody = JSON.parse((sessionInit as RequestInit).body as string);
    expect(sessionBody.email).toBe(
      'visitor+11111111-2222-3333-4444-555555555555@portfolio.local',
    );
    expect(sessionBody.mode).toBe('3kok');

    const [calledUrl, init] = fetchMock.mock.calls[1];
    expect(String(calledUrl)).toBe('https://bot.example.test/chat/request');
    const headers = new Headers((init as RequestInit).headers);
    expect(headers.get('Authorization')).toBe('Bearer super-secret-token');
    expect(headers.get('Content-Type')).toBe('application/json');
    const forwardedBody = JSON.parse((init as RequestInit).body as string);
    expect(forwardedBody.question).toBe('hello');
    expect(forwardedBody.session_id).toBe('sess-1');
  });

  // AC-T7-4: NO secret leaks in the response body.
  it('does NOT leak the bot secret in the response (AC-T7-4)', async () => {
    mockBot({ id: 'pend-456', status: 'pending' });
    const req = allowedPost({
      message: 'x',
      client_request_id: '22222222-2222-3333-4444-555555555555',
    });
    const res = await POST(req as unknown as Request);
    const text = await res.text();
    expect(text).not.toContain('super-secret-token');
  });
});

// --------------------------------------------------------------------------
// AC-T7-3: GET status forwards to /pending/{pendingId} and maps `answered`.
// --------------------------------------------------------------------------
describe('AC-T7-3 GET /api/chat?pendingId=…', () => {
  it('forwards to /pending/{id} and returns the answer + sources when answered', async () => {
    fetchMock.mockResolvedValue(
      jsonRes({
        status: 'answered',
        answer: 'Reach me at fiez@example.com',
        sources: [{ title: 'Contact', url: 'https://fiez.dev/contact' }],
      }),
    );

    const req = allowedGet();
    const res = await GET(req as unknown as Request);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('answered');
    expect(json.answer).toBe('Reach me at fiez@example.com');
    expect(json.sources).toHaveLength(1);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = fetchMock.mock.calls[0];
    expect(String(calledUrl)).toBe('https://bot.example.test/pending/pend-1');
    const headers = new Headers((init as RequestInit).headers);
    expect(headers.get('Authorization')).toBe('Bearer super-secret-token');
  });
});

// --------------------------------------------------------------------------
// AC-T11-6: X-Correlation-Id is forwarded (or minted) to the bot on both hops.
// --------------------------------------------------------------------------
describe('AC-T11-6 X-Correlation-Id propagation', () => {
  it('POST forwards the incoming X-Correlation-Id header to the bot', async () => {
    mockBot({ id: 'pend-cid', status: 'pending' });
    const incoming = '11111111-2222-3333-4444-555555555555';

    const req = allowedPost(
      { message: 'hello', client_request_id: 'cid-req-1' },
      { 'X-Correlation-Id': incoming },
    );
    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(202);

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers((init as RequestInit).headers);
    expect(headers.get('X-Correlation-Id')).toBe(incoming);
  });

  it('POST mints a UUID X-Correlation-Id when the caller sent none', async () => {
    mockBot({ id: 'pend-mint', status: 'pending' });
    const req = allowedPost({
      message: 'hello',
      client_request_id: 'cid-req-2',
    });
    await POST(req as unknown as Request);

    const [, init] = fetchMock.mock.calls[0];
    const forwarded = new Headers((init as RequestInit).headers).get(
      'X-Correlation-Id',
    );
    expect(forwarded).toBeTruthy();
    expect(forwarded).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('GET forwards the incoming X-Correlation-Id header to the bot /pending poll', async () => {
    fetchMock.mockResolvedValue(jsonRes({ status: 'pending' }));
    const incoming = 'deadbeef-0000-1111-2222-333333333333';

    const url = new URL('https://fiez.dev/api/chat?pendingId=poll-1');
    const req = new Request(url.toString(), {
      method: 'GET',
      headers: {
        Origin: ALLOWED_ORIGIN,
        'X-Correlation-Id': incoming,
      },
    });
    await GET(req as unknown as Request);

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers((init as RequestInit).headers);
    expect(headers.get('X-Correlation-Id')).toBe(incoming);
  });
});

// --------------------------------------------------------------------------
// AC-T7-4 (grep-style assertion): the route module file does not expose
// NEXT_PUBLIC_-prefixed bot env vars or hardcode the secret in source.
// --------------------------------------------------------------------------
describe('AC-T7-4 no client-exposed secret', () => {
  it('the route source references only server-side env names', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const src = fs.readFileSync(
      path.resolve(process.cwd(), 'src/app/api/chat/route.ts'),
      'utf8',
    );
    expect(src).not.toMatch(/NEXT_PUBLIC_PORTFOLIO_BOT/);
    expect(src).toMatch(/process\.env\.PORTFOLIO_BOT_SECRET/);
    expect(src).not.toMatch(/Authorization['"\s:]+['"]Bearer\s+super-secret/);
  });
});

// ==========================================================================
// REVIEW FIXES
// ==========================================================================

// [HIGH] Origin allowlist -------------------------------------------------
describe('[HIGH] Origin/Referer allowlist', () => {
  it('rejects an off-origin POST with 403 and does NOT forward to the bot', async () => {
    fetchMock.mockResolvedValue(jsonRes({ pendingId: 'x' }, 202));
    const req = new Request('https://evil.example.test/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://evil.example.test',
      },
      body: JSON.stringify({
        message: 'hello',
        client_request_id: 'evil-1',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('origin_not_allowed');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects an off-origin GET with 403', async () => {
    const req = new Request('https://evil.example.test/api/chat?pendingId=x', {
      method: 'GET',
      headers: { Origin: 'https://evil.example.test' },
    });
    const res = await GET(req);
    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('accepts a POST with a same-origin Referer when no Origin is sent', async () => {
    mockBot();
    const req = new Request('https://fiez.dev/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: 'https://fiez.dev/contact',
      },
      body: JSON.stringify({
        message: 'hello',
        client_request_id: 'ref-1',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(202);
    expect(fetchMock).toHaveBeenCalled();
  });

  it('respects PORTFOLIO_ALLOWED_ORIGINS override (localhost allowed in dev)', async () => {
    process.env.PORTFOLIO_ALLOWED_ORIGINS =
      'http://localhost:3000,https://fiez.dev';
    mockBot();
    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:3000',
      },
      body: JSON.stringify({
        message: 'hi',
        client_request_id: 'dev-1',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(202);
  });
});

// [HIGH] Message length cap ----------------------------------------------
describe('[HIGH] message length cap', () => {
  it('rejects an empty/whitespace message with 400 message_required', async () => {
    const req = allowedPost({ message: '   ', client_request_id: 'x' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('message_required');
  });

  it('rejects a message over 4000 chars with 400 message_too_long', async () => {
    const req = allowedPost({
      message: 'a'.repeat(4001),
      client_request_id: 'x',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('message_too_long');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('accepts a message of exactly 4000 chars', async () => {
    mockBot();
    const req = allowedPost({
      message: 'a'.repeat(4000),
      client_request_id: 'x',
    });
    const res = await POST(req);
    expect(res.status).toBe(202);
  });
});

// [HIGH] Per-IP rate limit ------------------------------------------------
describe('[HIGH] per-IP token-bucket rate limit', () => {
  it('returns 429 once the burst is exceeded', async () => {
    // Each call returns a FRESH Response — a Response body can only be read
    // once, and the route consumes upstream.text() on each success.
    mockBot();
    // Burst is 5 — the first 5 succeed, the 6th is throttled.
    const results: number[] = [];
    for (let i = 0; i < 6; i++) {
      const req = allowedPost({ message: 'hi', client_request_id: `r-${i}` });
      const res = await POST(req);
      results.push(res.status);
    }
    expect(results.slice(0, 5)).toEqual([202, 202, 202, 202, 202]);
    expect(results[5]).toBe(429);
  });

  it('429 response body is rate_limited', async () => {
    mockBot();
    for (let i = 0; i < 5; i++) {
      await POST(allowedPost({ message: 'hi', client_request_id: `b-${i}` }));
    }
    const res = await POST(
      allowedPost({ message: 'hi', client_request_id: 'over' }),
    );
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error).toBe('rate_limited');
  });
});

// [MED] GET response allowlist + headers ---------------------------------
describe('[MED] GET response allowlist + security headers', () => {
  it('allowlists to {status, answer, sources} and strips other bot keys', async () => {
    fetchMock.mockResolvedValue(
      jsonRes({
        status: 'answered',
        answer: 'yes',
        sources: [{ title: 's', url: 'https://fiez.dev/s' }],
        internal_debug: 'should_not_leak',
        secret_token: 'leak-me-not',
        user_email: 'should_not_leak',
      }),
    );
    const res = await GET(allowedGet());
    const json = await res.json();
    expect(Object.keys(json).sort()).toEqual(['answer', 'sources', 'status']);
    expect(json).not.toHaveProperty('internal_debug');
    expect(json).not.toHaveProperty('secret_token');
    expect(json).not.toHaveProperty('user_email');
  });

  it('GET 200 response carries nosniff + no-store headers', async () => {
    fetchMock.mockResolvedValue(jsonRes({ status: 'answered', answer: 'x' }));
    const res = await GET(allowedGet());
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });

  it('POST 202 response carries nosniff + no-store headers', async () => {
    mockBot();
    const res = await POST(
      allowedPost({ message: 'hi', client_request_id: 'h-1' }),
    );
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });
});

// [LOW] bot_unreachable vs bot_not_configured ---------------------------
describe('[LOW] serverUnavailable distinguishes config vs unreachable', () => {
  it('returns bot_not_configured when env is missing (503)', async () => {
    delete process.env.PORTFOLIO_BOT_URL;
    const req = allowedPost({ message: 'hi', client_request_id: 'c-1' });
    const res = await POST(req);
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.error).toBe('bot_not_configured');
  });

  it('returns bot_unreachable on POST fetch network failure (502)', async () => {
    fetchMock.mockRejectedValue(new TypeError('network down'));
    const req = allowedPost({ message: 'hi', client_request_id: 'c-2' });
    const res = await POST(req);
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toBe('bot_unreachable');
  });

  it('returns bot_unreachable on upstream 5xx (passes upstream status)', async () => {
    fetchMock.mockResolvedValue(jsonRes({ err: 'oops' }, 503));
    const req = allowedPost({ message: 'hi', client_request_id: 'c-3' });
    const res = await POST(req);
    // Upstream status is preserved; error kind is bot_unreachable.
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.error).toBe('bot_unreachable');
  });

  it('returns bot_unreachable on GET fetch network failure (502)', async () => {
    fetchMock.mockRejectedValue(new TypeError('network down'));
    const res = await GET(allowedGet());
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toBe('bot_unreachable');
  });
});

// --------------------------------------------------------------------------
// Session continuity. The route used to mint a NEW bot session per message
// (visitor+<random-uuid>@…), so the bot answered every question as turn one
// while the widget displayed a continuous transcript.
// --------------------------------------------------------------------------
describe('session reuse + transcript rehydrate', () => {
  it('reuses a supplied sessionId and skips the /session hop', async () => {
    mockBot();
    const req = allowedPost({
      message: 'and the AWS part?',
      client_request_id: 'crid-1',
      sessionId: 'sess-existing',
    });
    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({
      pendingId: 'pend-123',
      sessionId: 'sess-existing',
      status: 'pending',
    });
    // ONE hop only — no session creation.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('https://bot.example.test/chat/request');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.session_id).toBe('sess-existing');
  });

  it('puts a sanitised display name in the session identity', async () => {
    mockBot();
    const req = allowedPost({
      message: 'hi',
      client_request_id: 'crid-2',
      displayName: 'Ittipol V! <script>',
    });
    await POST(req as unknown as Request);
    const [, sessionInit] = fetchMock.mock.calls[0];
    const body = JSON.parse((sessionInit as RequestInit).body as string);
    expect(body.email).toMatch(/^visitor\+ittipol-v-script-crid-2@portfolio\.local$/);
    expect(body.email).not.toMatch(/[<>!]/);
  });

  it('rehydrates a transcript and allowlists the rows', async () => {
    fetchMock.mockResolvedValue(
      jsonRes([
        { role: 'user', content: 'who are you', extra: 'dropme' },
        { role: 'assistant', content: 'I am Fiez', sources: [{ label: 'a' }] },
        { role: 'system', content: 'should be filtered' },
        { role: 'assistant', content: 42 },
      ]),
    );
    const req = new Request('https://fiez.dev/api/chat?sessionId=sess-9', {
      method: 'GET',
      headers: { Origin: ALLOWED_ORIGIN },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      messages: [
        { role: 'user', content: 'who are you' },
        { role: 'assistant', content: 'I am Fiez', sources: [{ label: 'a' }] },
      ],
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/widget/messages?session_id=sess-9');
    // Signed on the PATH only (no query), matching the bot contract.
    const headers = new Headers((init as RequestInit).headers);
    expect(headers.get('X-Signature')).toBeTruthy();
    expect(headers.get('Authorization')).toBe('Bearer super-secret-token');
  });
});
