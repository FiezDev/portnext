/**
 * @jest-environment node
 */
import '@testing-library/jest-dom';

// We import the route handlers directly. route.ts exports POST + GET.
import { POST, GET } from '@/app/api/chat/route';

// --- Fetch mock ----------------------------------------------------------
type FetchImpl = typeof fetch;
let fetchMock: jest.Mock<ReturnType<FetchImpl>, Parameters<FetchImpl>>;

beforeEach(() => {
  fetchMock = jest.fn() as unknown as jest.Mock<
    ReturnType<FetchImpl>,
    Parameters<FetchImpl>
  >;
  (globalThis as { fetch: FetchImpl }).fetch = fetchMock;

  // SERVER-SIDE env. Must NEVER be NEXT_PUBLIC_.
  process.env.PORTFOLIO_BOT_URL = 'https://bot.example.test';
  process.env.PORTFOLIO_BOT_SECRET = 'super-secret-token';
});

afterEach(() => {
  delete process.env.PORTFOLIO_BOT_URL;
  delete process.env.PORTFOLIO_BOT_SECRET;
});

function jsonRes(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// --------------------------------------------------------------------------
// AC-T7-2: POST forwards to PORTFOLIO_BOT_URL/chat/request with Bearer secret
// AC-T7-6: forwards client_request_id (bot dedupes)
// --------------------------------------------------------------------------
describe('AC-T7-2 / AC-T7-6 POST /api/chat', () => {
  it('forwards the message to the bot with Bearer secret + client_request_id and returns pendingId', async () => {
    fetchMock.mockResolvedValue(
      jsonRes({ pendingId: 'pend-123', status: 'pending' }, 202),
    );

    const req = new Request('https://host.test/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'hello',
        mode: '3kok',
        client_request_id: '11111111-2222-3333-4444-555555555555',
      }),
    });
    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(202);
    const json = await res.json();
    expect(json).toEqual({ pendingId: 'pend-123', status: 'pending' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = fetchMock.mock.calls[0];
    expect(String(calledUrl)).toBe(
      'https://bot.example.test/chat/request',
    );
    const headers = new Headers((init as RequestInit).headers);
    expect(headers.get('Authorization')).toBe('Bearer super-secret-token');
    expect(headers.get('Content-Type')).toBe('application/json');
    const forwardedBody = JSON.parse((init as RequestInit).body as string);
    expect(forwardedBody.message).toBe('hello');
    expect(forwardedBody.client_request_id).toBe(
      '11111111-2222-3333-4444-555555555555',
    );
  });

  // AC-T7-4: NO secret leaks in the response body.
  it('does NOT leak the bot secret in the response (AC-T7-4)', async () => {
    fetchMock.mockResolvedValue(
      jsonRes({ pendingId: 'pend-456', status: 'pending' }, 202),
    );
    const req = new Request('https://host.test/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'x',
        client_request_id: '22222222-2222-3333-4444-555555555555',
      }),
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

    const url = new URL('https://host.test/api/chat?pendingId=pend-123');
    const req = new Request(url.toString(), { method: 'GET' });
    // Next.js passes the parsed URL via the request; the route uses new URL(req.url).
    const res = await GET(req as unknown as Request);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('answered');
    expect(json.answer).toBe('Reach me at fiez@example.com');
    expect(json.sources).toHaveLength(1);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = fetchMock.mock.calls[0];
    expect(String(calledUrl)).toBe(
      'https://bot.example.test/pending/pend-123',
    );
    const headers = new Headers((init as RequestInit).headers);
    expect(headers.get('Authorization')).toBe('Bearer super-secret-token');
  });
});

// --------------------------------------------------------------------------
// AC-T11-6: X-Correlation-Id is forwarded (or minted) to the bot on both hops.
// --------------------------------------------------------------------------
describe('AC-T11-6 X-Correlation-Id propagation', () => {
  it('POST forwards the incoming X-Correlation-Id header to the bot', async () => {
    fetchMock.mockResolvedValue(
      jsonRes({ pendingId: 'pend-cid', status: 'pending' }, 202),
    );
    const incoming = '11111111-2222-3333-4444-555555555555';

    const req = new Request('https://host.test/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-Id': incoming,
      },
      body: JSON.stringify({
        message: 'hello',
        client_request_id: 'cid-req-1',
      }),
    });
    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(202);

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers((init as RequestInit).headers);
    expect(headers.get('X-Correlation-Id')).toBe(incoming);
  });

  it('POST mints a UUID X-Correlation-Id when the caller sent none', async () => {
    fetchMock.mockResolvedValue(
      jsonRes({ pendingId: 'pend-mint', status: 'pending' }, 202),
    );
    const req = new Request('https://host.test/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'hello',
        client_request_id: 'cid-req-2',
      }),
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

    const url = new URL('https://host.test/api/chat?pendingId=poll-1');
    const req = new Request(url.toString(), {
      method: 'GET',
      headers: { 'X-Correlation-Id': incoming },
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
      path.resolve(
        process.cwd(),
        'src/app/api/chat/route.ts',
      ),
      'utf8',
    );
    // No NEXT_PUBLIC_ bot vars.
    expect(src).not.toMatch(/NEXT_PUBLIC_PORTFOLIO_BOT/);
    // The secret must be read from process.env, never inlined.
    expect(src).toMatch(/process\.env\.PORTFOLIO_BOT_SECRET/);
    // No hardcoded Bearer literal that is the secret itself (we look for the
    // obvious anti-pattern of assigning a literal string to Authorization).
    expect(src).not.toMatch(/Authorization['"\s:]+['"]Bearer\s+super-secret/);
  });
});
