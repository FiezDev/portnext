import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FloatingChat from '@/components/global/FloatingChat';

// One-bubble + quick-reply chip entry model (AC-T3-1..4). The old two-FAB mode
// switcher is gone; mode is chosen by tapping a chip (auto-send) or free-typing
// (personal). Seed a returning visitor to skip the identity gate.
function seedReturningVisitor(name = 'Tester') {
  localStorage.setItem(
    'concierge_session_v1',
    JSON.stringify({
      displayName: name,
      sessionId: { personal: null, '3kok': null },
      messages: { personal: [], '3kok': [] },
    }),
  );
}

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
  localStorage.clear();
  seedReturningVisitor();
  fetchMock = jest.fn() as unknown as FetchMock;
  (globalThis as { fetch: unknown }).fetch = fetchMock;
  fetchMock.mockResolvedValue(jsonRes({ status: 'pending' }));
  jest.useRealTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

function postedBody(): Record<string, unknown> | undefined {
  const postCall = fetchMock.mock.calls.find(
    ([url, init]) =>
      String(url).includes('/api/chat') &&
      (init as RequestInit | undefined)?.method === 'POST',
  );
  if (!postCall) return undefined;
  return JSON.parse((postCall[1] as RequestInit).body as string);
}

describe('AC-T3-1 single chat bubble', () => {
  it('renders exactly one chat launcher (the two mode FABs are gone)', () => {
    render(<FloatingChat />);
    expect(screen.getByRole('button', { name: /chat with fiez/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ask about me/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ask 3 kingdoms/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /chat with สามก๊ก/i })).not.toBeInTheDocument();
  });
});

describe('AC-T3-2 quick-reply chips', () => {
  it('renders personal + 3kok chips after opening', async () => {
    render(<FloatingChat />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /chat with fiez/i }));
    });
    expect(screen.getByRole('button', { name: /what can you do/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /summarise สามก๊ก/i })).toBeInTheDocument();
  });
});

describe('AC-T3-3 chip auto-sends in the right mode', () => {
  it('a 3kok chip sends mode:"3kok"', async () => {
    jest.useFakeTimers();
    fetchMock.mockResolvedValueOnce(jsonRes({ pendingId: 'p-3kok', status: 'pending' }, 202));
    render(<FloatingChat pollMinMs={50} pollMaxMs={50} pollDurationMaxMs={60_000} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /chat with fiez/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /summarise สามก๊ก/i }));
    });
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });
    const posted = postedBody();
    expect(posted).toBeDefined();
    expect(posted!.mode).toBe('3kok');
    expect(posted!.message).toBe('Summarise สามก๊ก (Romance of the Three Kingdoms)');
    // Chips disable while an answer is pending (disabled={status === 'awaiting' || status === 'composing'}).
    expect(screen.getByRole('button', { name: /summarise/i })).toBeDisabled();
    jest.useRealTimers();
  });

  it('a personal chip sends mode:"personal"', async () => {
    jest.useFakeTimers();
    fetchMock.mockResolvedValueOnce(jsonRes({ pendingId: 'p-p', status: 'pending' }, 202));
    render(<FloatingChat pollMinMs={50} pollMaxMs={50} pollDurationMaxMs={60_000} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /chat with fiez/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /what can you do/i }));
    });
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });
    const posted = postedBody();
    expect(posted).toBeDefined();
    expect(posted!.mode).toBe('personal');
    expect(posted!.message).toBe('What can you do?');
    jest.useRealTimers();
  });

  // Regression guard for the answer-routing fix (pollModeRef). A chip does
  // setMode + send in one tap; before the fix the queued poll closed over the
  // PRE-switch mode and the answer landed in the wrong bot's transcript
  // (invisible in the now-active mode). This test passes WITH pollModeRef and
  // would fail without it.
  it('routes the polled answer to the chip mode, not the pre-switch mode', async () => {
    jest.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(jsonRes({ pendingId: 'p-route', status: 'pending' }, 202))
      .mockResolvedValueOnce(
        jsonRes({ status: 'answered', answer: 'Routed-to-3kok canary' }),
      );

    const { container } = render(
      <FloatingChat pollMinMs={50} pollMaxMs={50} pollDurationMaxMs={60_000} />,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /chat with fiez/i }));
    });
    // Default mode is personal; the 3kok chip switches mode + sends in one tap.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /summarise สามก๊ก/i }));
    });
    // Drive the POST microtask + the first scheduled poll (50ms).
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });
    // First poll returns answered.
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });

    // The chip switched the panel to 3kok. Without the fix the answer would
    // have been appended to the old personal mode (invisible here) — seeing
    // the canary proves it routed to the chip's mode.
    await waitFor(() => {
      expect(container).toHaveTextContent(/Routed-to-3kok canary/i);
    });
    jest.useRealTimers();
  });
});

describe('AC-T3-4 free text defaults to personal', () => {
  it('sends mode:"personal" for typed text', async () => {
    jest.useFakeTimers();
    fetchMock.mockResolvedValueOnce(jsonRes({ pendingId: 'p-ft', status: 'pending' }, 202));
    render(<FloatingChat pollMinMs={50} pollMaxMs={50} pollDurationMaxMs={60_000} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /chat with fiez/i }));
    });
    const input = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'a custom question' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
    });
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });
    const posted = postedBody();
    expect(posted).toBeDefined();
    expect(posted!.mode).toBe('personal');
    expect(posted!.message).toBe('a custom question');
    jest.useRealTimers();
  });
});
