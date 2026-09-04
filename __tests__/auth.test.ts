/**
 * @jest-environment node
 *
 * T4/T10 — HMAC widget→bot auth (AC-T4-1, stress-#3 upgrade).
 *
 * AC-T4-1a: the `signHeaders(secret, url, body?, base?)` helper computes
 *   - Authorization: `Bearer <secret>`
 *   - X-Timestamp:  unix seconds (string), within ±60s of now
 *   - X-Signature:  HMAC-SHA256(secret,
 *                     "<ts>:<path>:sha256hex(material)") hex, where path is
 *                     the pathname of the bot URL being fetched and material
 *                     is the raw request body when non-empty, else the URL's
 *                     search string INCLUDING the leading '?'.
 *
 * AC-T4-1b: POST + GET route handlers attach those three headers to ALL bot
 * fetches (POST /session, POST /chat/request, GET /pending/{id},
 * GET /widget/messages?session_id=…), each signing its own body/query.
 *
 * Bot contract (must match workers/src/services/widget-auth.ts exactly):
 *   X-Timestamp = unix seconds (bot rejects if |now-ts| > 60)
 *   X-Signature = HMAC-SHA256(secret, "<ts>:<path>:sha256hex(body||search)")
 */
import "@testing-library/jest-dom";
import { createHash, createHmac } from "crypto";
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

// Expected HMAC for a given (secret, ts, path, material) — mirrors the bot
// formula workers/src/services/widget-auth.ts so a drift in either direction
// surfaces here. material = raw body when non-empty, else url.search.
function expectedSig(
  secret: string,
  ts: string,
  path: string,
  material: string,
): string {
  const materialHash = createHash("sha256").update(material).digest("hex");
  return createHmac("sha256", secret)
    .update(`${ts}:${path}:${materialHash}`)
    .digest("hex");
}

const SHA256_EMPTY =
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

// --------------------------------------------------------------------------
// AC-T4-1a — signHeaders helper unit
// --------------------------------------------------------------------------
describe("AC-T4-1a signHeaders(secret, url, body?, base?)", () => {
  it("returns Authorization + X-Timestamp (±60s of now) + X-Signature = HMAC(ts:path:sha256(body))", () => {
    const body = '{"email":"a@b.c","mode":"personal"}';
    const h = signHeaders("sek", "/session", body);
    expect(h.Authorization).toBe("Bearer sek");
    expect(h["X-Timestamp"]).toMatch(/^\d+$/);
    const ts = h["X-Timestamp"] as string;
    const now = Math.floor(Date.now() / 1000);
    expect(Number(ts)).toBeGreaterThanOrEqual(now - 60);
    expect(Number(ts)).toBeLessThanOrEqual(now + 60);
    expect(h["X-Signature"]).toBe(expectedSig("sek", ts, "/session", body));
  });

  it("matches the fixed vector ts=1700000000 / secret=sek / path=/chat/request / body={\"x\":1}", () => {
    // Pinned timestamp so the signature is a known constant — catches any
    // drift in the HMAC formula, the path string, or the body hash.
    jest.useFakeTimers({ now: 1700000000_000 });
    try {
      const h = signHeaders("sek", "/chat/request", '{"x":1}');
      expect(h["X-Timestamp"]).toBe("1700000000");
      // openssl: printf '1700000000:/chat/request:<sha256hex of {"x":1}>' |
      //          openssl dgst -sha256 -hmac "sek"
      expect(h["X-Signature"]).toBe(
        "4f43f93ea449c6626fb6fee510b1c041576b0de7d12fe46b79185e4c22bd0f0d",
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it("signs over the pathname of a full bot URL; query rides the material only when there is no body", () => {
    // The route passes the FULL bot URL into signHeaders; the helper must
    // extract just the pathname so it matches the bot-side `<ts>:<path>`.
    const h = signHeaders("sek", "https://bot.example.test/pending/abc-123?poll=1");
    const ts = h["X-Timestamp"] as string;
    expect(h["X-Signature"]).toBe(expectedSig("sek", ts, "/pending/abc-123", "?poll=1"));
  });

  it("GET without query or body signs sha256(\"\") as the material", () => {
    jest.useFakeTimers({ now: 1700000000_000 });
    try {
      const h = signHeaders("sek", "https://bot.example.test/pending/pend-1");
      expect(h["X-Signature"]).toBe(
        expectedSig("sek", "1700000000", "/pending/pend-1", ""),
      );
      // and the material hash itself is the canonical empty-string digest
      expect(createHash("sha256").update("").digest("hex")).toBe(SHA256_EMPTY);
    } finally {
      jest.useRealTimers();
    }
  });

  it("signs a query-only GET over the raw search string including '?'", () => {
    jest.useFakeTimers({ now: 1700000000_000 });
    try {
      const h = signHeaders(
        "sek",
        "https://bot.example.test/widget/messages?session_id=abc",
      );
      // openssl: printf '1700000000:/widget/messages:<sha256hex of "?session_id=abc">' |
      //          openssl dgst -sha256 -hmac "sek"
      expect(h["X-Signature"]).toBe(
        "f8cfb9c1fbfbb3c2b6956cf21398e772f6e0f1a1966fe130a68998cc63456021",
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it("merges a base header object; Authorization always comes from the secret", () => {
    const h = signHeaders("sek", "/session", '{"x":1}', {
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
// AC-T4-1b — HMAC headers on all bot fetch sites
// --------------------------------------------------------------------------
describe("AC-T4-1b HMAC headers attached to all bot fetches", () => {
  it("POST attaches HMAC headers to /session AND /chat/request, each signing its own body", async () => {
    // The POST handler fans out to 2 bot endpoints: create-session then
    // chat-request. Each must carry the HMAC trio over its OWN body.
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
    for (const [url, init] of fetchMock.mock.calls) {
      const u = new URL(String(url));
      const i = init as RequestInit;
      const headers = new Headers(i.headers);
      expect(headers.get("Authorization")).toBe(`Bearer ${BOT_SECRET}`);
      const ts = headers.get("X-Timestamp");
      expect(ts).toMatch(/^\d+$/);
      const sig = headers.get("X-Signature");
      expect(sig).toMatch(/^[0-9a-f]{64}$/);
      // the signed material is EXACTLY the body string sent on the wire
      expect(sig).toBe(expectedSig(BOT_SECRET, ts as string, u.pathname, String(i.body)));
    }
  });

  it("GET attaches HMAC headers to /pending/{id} (empty material)", async () => {
    fetchMock.mockResolvedValue(jsonRes({ status: "pending" }));

    const res = await GET(allowedGet());
    expect(res.status).toBe(200);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(`${BOT_URL}/pending/pend-1`);

    const headers = new Headers((init as RequestInit).headers);
    expect(headers.get("Authorization")).toBe(`Bearer ${BOT_SECRET}`);
    const ts = headers.get("X-Timestamp");
    const sig = headers.get("X-Signature");
    expect(sig).toBe(expectedSig(BOT_SECRET, ts as string, "/pending/pend-1", ""));
  });

  it("GET history rehydrate signs /widget/messages over its query string", async () => {
    fetchMock.mockResolvedValue(jsonRes([]));

    const res = await GET(
      new Request("https://fiez.dev/api/chat?sessionId=sess-9", {
        method: "GET",
        headers: { Origin: ALLOWED_ORIGIN },
      }),
    );
    expect(res.status).toBe(200);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    const u = new URL(String(url));
    expect(u.pathname).toBe("/widget/messages");
    expect(u.searchParams.get("session_id")).toBe("sess-9");

    const headers = new Headers((init as RequestInit).headers);
    const ts = headers.get("X-Timestamp");
    expect(headers.get("X-Signature")).toBe(
      expectedSig(BOT_SECRET, ts as string, "/widget/messages", u.search),
    );
  });

  it("3 total fetches across POST (2) + GET (1) — every one carries the HMAC trio", async () => {
    // End-to-end shape: a sendback (POST → 2 fetches) followed by a poll
    // (GET → 1 fetch). All outgoing requests must be signed.
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
