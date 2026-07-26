import { fireEvent, render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import FloatingChat from "@/components/global/FloatingChat";

// --- Shared fetch mock ---------------------------------------------------
// Same plumbing as __tests__/FloatingChat.test.tsx — jsdom has no global
// Response/Request, so we return a minimal plain object that quacks like a
// Response (only the fields the widget reads).
interface FakeResponse {
  status: number;
  ok: boolean;
  text: () => Promise<string>;
  json: () => Promise<unknown>;
}
type FetchImpl = typeof fetch;
type FetchMock = jest.Mock<Promise<FakeResponse>, Parameters<FetchImpl>>;
let fetchMock: FetchMock;

function jsonRes(body: unknown, status = 200): FakeResponse {
  const text = JSON.stringify(body);
  return {
    status,
    ok: status >= 200 && status < 300,
    text: () => Promise.resolve(text),
    json: () => Promise.resolve(JSON.parse(text)),
  };
}

beforeEach(() => {
  fetchMock = jest.fn() as unknown as FetchMock;
  (globalThis as { fetch: unknown }).fetch = fetchMock;
  // Default: any unplanned poll returns pending (no answer).
  fetchMock.mockResolvedValue(jsonRes({ status: "pending" }));
  jest.useRealTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// Helper: open the panel via the named FAB, type, click send.
async function sendViaFab(fabName: RegExp, text: string) {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: fabName }));
  });
  const input = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
  await act(async () => {
    fireEvent.change(input, { target: { value: text } });
  });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /send/i }));
  });
}

// --------------------------------------------------------------------------
// AC-T2-1: two themed entry FABs; clicking either opens the panel pinned to
// its mode and the header reflects the active bot.
// --------------------------------------------------------------------------
describe("AC-T2-1 two-FAB mode wiring", () => {
  it("renders BOTH entry FABs (Artemis + สามก๊ก)", () => {
    render(<FloatingChat />);
    expect(
      screen.getByRole("button", { name: /chat with artemis/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /chat with สามก๊ก/i }),
    ).toBeInTheDocument();
  });

  it("clicking สามก๊ก opens the panel + header shows the สามก๊ก bot", async () => {
    render(<FloatingChat />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /chat with สามก๊ก/i }));
    });
    // Panel is open.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // Header reflects the active bot (role=heading so screen readers announce it).
    expect(
      screen.getByRole("heading", { name: /สามก๊ก/i }),
    ).toBeInTheDocument();
  });

  it("clicking Artemis opens the panel + header shows Artemis", async () => {
    render(<FloatingChat />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /chat with artemis/i }));
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /artemis/i }),
    ).toBeInTheDocument();
  });
});

// --------------------------------------------------------------------------
// AC-T2-2: the selected FAB's mode literal is what hits POST /api/chat.
// --------------------------------------------------------------------------
describe("AC-T2-2 mode literal sent on POST", () => {
  it("sends mode:\"3kok\" after the สามก๊ก FAB is used", async () => {
    jest.useFakeTimers();
    fetchMock.mockResolvedValueOnce(
      jsonRes({ pendingId: "p-3kok", status: "pending" }, 202),
    );

    render(<FloatingChat pollMinMs={50} pollMaxMs={50} pollDurationMaxMs={60_000} />);

    await sendViaFab(/chat with สามก๊ก/i, "ทดสอบ");

    // Drive the POST microtask.
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });

    const postCall = fetchMock.mock.calls.find(
      ([url, init]) =>
        String(url).includes("/api/chat") &&
        (init as RequestInit | undefined)?.method === "POST",
    );
    expect(postCall).toBeDefined();
    const posted = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(posted.mode).toBe("3kok");
    jest.useRealTimers();
  });

  it("sends mode:\"personal\" after the Artemis FAB is used", async () => {
    jest.useFakeTimers();
    fetchMock.mockResolvedValueOnce(
      jsonRes({ pendingId: "p-personal", status: "pending" }, 202),
    );

    render(<FloatingChat pollMinMs={50} pollMaxMs={50} pollDurationMaxMs={60_000} />);

    await sendViaFab(/chat with artemis/i, "hello");

    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });

    const postCall = fetchMock.mock.calls.find(
      ([url, init]) =>
        String(url).includes("/api/chat") &&
        (init as RequestInit | undefined)?.method === "POST",
    );
    expect(postCall).toBeDefined();
    const posted = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(posted.mode).toBe("personal");
    jest.useRealTimers();
  });
});
