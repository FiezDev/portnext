import { fireEvent, render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import FloatingChat from "@/components/global/FloatingChat";

// --- Shared fetch mock (same shape as the other suites) -----------------
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
  fetchMock.mockResolvedValue(jsonRes({ status: "pending" }));
  // AC-T3-2: each consent test must start from a clean localStorage so the
  // useState initializer reads a deterministic value.
  window.localStorage.clear();
  jest.useRealTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// Helper: open the panel via the Artemis FAB.
async function openPanel() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /chat with artemis/i }));
  });
}

// --------------------------------------------------------------------------
// AC-T3-1: after opening the panel, the consent copy is visible.
// --------------------------------------------------------------------------
describe("AC-T3-1 consent row copy", () => {
  it("renders the owner-approval consent notice above the input", async () => {
    render(<FloatingChat />);
    await openPanel();

    // Substring match against the full consent sentence.
    expect(
      screen.getByText(/answered only after the owner approves/i),
    ).toBeInTheDocument();
  });
});

// --------------------------------------------------------------------------
// AC-T3-2: the dismiss (×) button hides the row, and a simulated reload
// (fresh mount with the localStorage key set) keeps it hidden.
// --------------------------------------------------------------------------
describe("AC-T3-2 consent row dismiss + persistence", () => {
  it("hides the row when × is clicked", async () => {
    render(<FloatingChat />);
    await openPanel();

    expect(
      screen.getByText(/answered only after the owner approves/i),
    ).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /dismiss consent notice/i }),
      );
    });

    expect(
      screen.queryByText(/answered only after the owner approves/i),
    ).not.toBeInTheDocument();
  });

  it("keeps the row hidden after a simulated reload (localStorage key set)", async () => {
    // First session: open + dismiss writes the localStorage flag.
    const { unmount } = render(<FloatingChat />);
    await openPanel();
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /dismiss consent notice/i }),
      );
    });
    expect(
      screen.queryByText(/answered only after the owner approves/i),
    ).not.toBeInTheDocument();
    // Sanity: the flag really was written.
    expect(window.localStorage.getItem("concierge_consent_dismissed")).toBe(
      "1",
    );

    // Simulate a page reload: unmount, then mount a fresh component instance.
    // The useState initializer reads localStorage → consentDismissed=true →
    // the row must stay hidden without any user interaction.
    unmount();
    render(<FloatingChat />);
    await openPanel();

    expect(
      screen.queryByText(/answered only after the owner approves/i),
    ).not.toBeInTheDocument();
  });
});
