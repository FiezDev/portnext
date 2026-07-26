/**
 * @jest-environment node
 *
 * T4 — HMAC widget→bot auth (AC-T4-1).
 *
 * AC-T4-1a: the `signHeaders(secret, url, base?)` helper computes
 *   - Authorization: `Bearer <secret>`
 *   - X-Timestamp:  unix seconds (string), within ±60s of now
 *   - X-Signature:  HMAC-SHA256(secret, "<ts>:<path>") hex, where path is the
 *                   pathname of the bot URL being fetched (/session,
 *                   /chat/request, /pending/{id}) — no query, no trailing slash.
 *
 * AC-T4-1b: POST + GET route handlers attach those three headers to ALL THREE
 * bot fetches (POST /session, POST /chat/request, GET /pending/{id}).
 *
 * Bot contract (must match app/widget_auth.py:require_widget_auth exactly):
 *   X-Timestamp = unix seconds (bot rejects if |now-ts| > 60)
 *   X-Signature = HMAC-SHA256(secret, "<ts>:<path>").hexdigest()
 */
import "@testing-library/jest-dom";
import { createHmac } from "crypto";
import {
  POST,
  GET,
  signHeaders,
  __resetRateLimit,
} from "@/app/api/chat/route";

// --- Fetch mock ----------------------------------------------------------
type FetchImpl = typeof fetch;
let fetchMock: jest.Mock<ReturnType<FetchImpl>, Parameters<FetchImpl>>;

const ALLOWED_ORIGIN = "https://fiez.dev";
const BOT_URL = "https://bot.example.test";
const BOT_SECRET = "super-secret-token";

beforeEach(() => {
  fetchMock = jest.fn() as unknown as jest.Mock<
    ReturnType<FetchImpl>,
    Parameters<FetchImpl>
  >;
  (globalThis as { fetch: FetchImpl }).fetch = fetchMock;

  process.env.PORTFOLIO_BOT_URL = BOT_URL;
  process.env.PORTFOLIO_BOT_SECRET = BOT_SECRET;
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
    headers: { "Content-Type": "application/json" },
  });
}

function allowedPost(
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
): Request {
  return new Request("https://fiez.dev/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: ALLOWED_ORIGIN,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function allowedGet(headers: Record<string, string> = {}): Request {
  return new Request("https://fiez.dev/api/chat?pendingId=pend-1", {
    method: "GET",
    headers: { Origin: ALLOWED_ORIGIN, ...headers },
  });
}

// Expected HMAC for a given (secret, ts, path) — mirrors the bot formula
// app/widget_auth.py:require_widget_auth so a drift in either direction
// surfaces here.
function expectedSig(secret: string, ts: string, path: string): string {
  return createHmac("sha256", secret)
    .update(`${ts}:${path}`)
    .digest("hex");
}

// --------------------------------------------------------------------------
// AC-T4-1a — signHeaders helper unit
// --------------------------------------------------------------------------
describe("AC-T4-1a signHeaders(secret, url, base?)", () => {
  it("returns Authorization + X-Timestamp (±60s of now) + X-Signature = HMAC(ts:path)", () => {
    const h = signHeaders("sek", "/session");
    expect(h.Authorization).toBe("Bearer sek");
    expect(h["X-Timestamp"]).toMatch(/^\d+$/);
    const ts = h["X-Timestamp"] as string;
    const now = Math.floor(Date.now() / 1000);
    expect(Number(ts)).toBeGreaterThanOrEqual(now - 60);
    expect(Number(ts)).toBeLessThanOrEqual(now + 60);
    expect(h["X-Signature"]).toBe(expectedSig("sek", ts, "/session"));
  });

  it("matches the fixed vector ts=1700000000 / secret=sek / path=/chat/request", () => {
    // Pinned timestamp so the signature is a known constant — catches any
    // drift in the HMAC formula or the path string.
    jest.useFakeTimers({ now: 1700000000_000 });
    try {
      const h = signHeaders("sek", "/chat/request");
      expect(h["X-Timestamp"]).toBe("1700000000");
      // echo -n "1700000000:/chat/request" | openssl dgst -sha256 -hmac "sek"
      expect(h["X-Signature"]).toBe(
        "ae6fce557ca63a040501aef2bd835eb856290df30e87be10b003639e2230bab4",
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it("signs over the pathname of a full bot URL (no query, no trailing slash)", () => {
    // The route passes the FULL bot URL into signHeaders; the helper must
    // extract just the pathname so it matches the bot-side `<ts>:<path>`.
    const h = signHeaders("sek", "https://bot.example.test/pending/abc-123?poll=1");
    const ts = h["X-Timestamp"] as string;
    expect(h["X-Signature"]).toBe(expectedSig("sek", ts, "/pending/abc-123"));
  });

  it("merges a base header object; Authorization always comes from the secret", () => {
    const h = signHeaders("sek", "/session", {
      "Content-Type": "application/json",
      "X-Correlation-Id": "cid-1",
    });
    expect(h["Content-Type"]).toBe("application/json");
    expect(h["X-Correlation-Id"]).toBe("cid-1");
    // Authorization is derived from the secret, not the base, so a stale
    // base can never override it.
    expect(h.Authorization).toBe("Bearer sek");
  });
});

// --------------------------------------------------------------------------
// AC-T4-1b — HMAC headers on all 3 bot fetch sites
// --------------------------------------------------------------------------
describe("AC-T4-1b HMAC headers attached to all 3 bot fetches", () => {
  it("POST attaches HMAC headers to /session AND /chat/request (2 fetches)", async () => {
    // The POST handler fans out to 2 bot endpoints: create-session then
    // chat-request. Each must carry the HMAC trio.
    fetchMock.mockImplementation((url: string | URL | Request) => {
      const u = String(url);
      if (u.endsWith("/session"))
        return Promise.resolve(jsonRes({ id: "sess-1" }, 201));
      if (u.endsWith("/chat/request"))
        return Promise.resolve(jsonRes({ id: "pend-1", status: "pending" }, 202));
      return Promise.resolve(jsonRes({}, 200));
    });

    const req = allowedPost({
      message: "hello",
      mode: "3kok",
      client_request_id: "cid-post",
    });
    const res = await POST(req);
    expect(res.status).toBe(202);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [sessionUrl, sessionInit] = fetchMock.mock.calls[0];
    const [chatUrl, chatInit] = fetchMock.mock.calls[1];
    expect(String(sessionUrl)).toBe(`${BOT_URL}/session`);
    expect(String(chatUrl)).toBe(`${BOT_URL}/chat/request`);

    for (const [label, init] of [
      ["/session", sessionInit],
      ["/chat/request", chatInit],
    ] as const) {
      const headers = new Headers((init as RequestInit).headers);
      expect(headers.get("Authorization")).toBe(`Bearer ${BOT_SECRET}`);
      const ts = headers.get("X-Timestamp");
      expect(ts).toMatch(/^\d+$/);
      const sig = headers.get("X-Signature");
      expect(sig).toMatch(/^[0-9a-f]{64}$/);
      expect(sig).toBe(expectedSig(BOT_SECRET, ts as string, label));
    }
  });

  it("GET attaches HMAC headers to /pending/{id} (1 fetch)", async () => {
    fetchMock.mockResolvedValue(jsonRes({ status: "pending" }));

    const res = await GET(allowedGet());
    expect(res.status).toBe(200);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(`${BOT_URL}/pending/pend-1`);

    const headers = new Headers((init as RequestInit).headers);
    expect(headers.get("Authorization")).toBe(`Bearer ${BOT_SECRET}`);
    const ts = headers.get("X-Timestamp");
    expect(ts).toMatch(/^\d+$/);
    const sig = headers.get("X-Signature");
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
    expect(sig).toBe(expectedSig(BOT_SECRET, ts as string, "/pending/pend-1"));
  });

  it("3 total fetches across POST (2) + GET (1) — every one carries the HMAC trio", async () => {
    // End-to-end shape: a sendback (POST → 2 fetches) followed by a poll
    // (GET → 1 fetch). All 3 outgoing requests must be signed.
    fetchMock.mockImplementation((url: string | URL | Request) => {
      const u = String(url);
      if (u.endsWith("/session"))
        return Promise.resolve(jsonRes({ id: "sess-1" }, 201));
      if (u.endsWith("/chat/request"))
        return Promise.resolve(jsonRes({ id: "pend-1", status: "pending" }, 202));
      if (u.includes("/pending/"))
        return Promise.resolve(jsonRes({ status: "pending" }));
      return Promise.resolve(jsonRes({}, 200));
    });

    await POST(allowedPost({ message: "hi", client_request_id: "cid-e2e" }));
    await GET(allowedGet());

    expect(fetchMock).toHaveBeenCalledTimes(3);
    for (const [, init] of fetchMock.mock.calls) {
      const headers = new Headers((init as RequestInit).headers);
      expect(headers.get("Authorization")).toBe(`Bearer ${BOT_SECRET}`);
      expect(headers.get("X-Timestamp")).toMatch(/^\d+$/);
      expect(headers.get("X-Signature")).toMatch(/^[0-9a-f]{64}$/);
    }
  });
});
