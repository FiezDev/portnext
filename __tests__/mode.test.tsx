import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FloatingChat from '@/components/global/FloatingChat';

// One bubble with a 2-line "AI"/"CHAT" launcher (AC-T3-1..4). The old two-FAB
// mode switcher AND the quick-reply chips are gone; mode is chosen at the
// identity gate via a Personal / 3-Kingdom toggle, then chat is plain free
// text in that mode. Seed a returning visitor (v2 Session[]) to skip the gate
// where useful.
function seedReturningVisitor(name = 'Tester') {
  const session = {
    id: 's-' + Math.random().toString(36).slice(2, 8),
    displayName: name,
    mode: 'personal' as const,
    sessionId: null,
    messages: [],
    createdAt: 1_700_000_000_000,
    updatedAt: 1_700_000_000_000,
  };
  localStorage.setItem('concierge_sessions_v2', JSON.stringify([session]));
  localStorage.setItem('concierge_active_session_v2', session.id);
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
  it('renders exactly one AI/CHAT launcher (the two mode FABs are gone)', () => {
    render(<FloatingChat />);
    expect(screen.getByRole('button', { name: /ai chat/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ask about me/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ask 3 kingdoms/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /chat สามก๊ก/i })).not.toBeInTheDocument();
  });
});

describe('AC-T3-2/3 gate bot-toggle drives send mode', () => {
  it('3 Kingdoms at the gate sends mode:"3kok"', async () => {
    localStorage.clear();
    jest.useFakeTimers();
    fetchMock.mockResolvedValueOnce(jsonRes({ pendingId: 'p-3kok', status: 'pending' }, 202));

    const { container } = render(
      <FloatingChat pollMinMs={50} pollMaxMs={50} pollDurationMaxMs={60_000} />,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /ai chat/i }));
    });
    // Review/training notice is shown at the gate.
    expect(container).toHaveTextContent(/reviewed by the site owner/i);
    // Pick 3 Kingdoms at the gate, enter name, start.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /3 kingdoms/i }));
    });
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Alex' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start chat/i }));
    });
    // Type + send free text.
    const input = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'a 3kok question' } });
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
    expect(posted!.mode).toBe('3kok');
    expect(posted!.message).toBe('a 3kok question');
    jest.useRealTimers();
  });

  it('Personal at the gate sends mode:"personal"', async () => {
    localStorage.clear();
    jest.useFakeTimers();
    fetchMock.mockResolvedValueOnce(jsonRes({ pendingId: 'p-p', status: 'pending' }, 202));

    render(<FloatingChat pollMinMs={50} pollMaxMs={50} pollDurationMaxMs={60_000} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /ai chat/i }));
    });
    // Personal is the default; tap it explicitly to prove the toggle drives mode.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^personal$/i }));
    });
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Alex' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start chat/i }));
    });
    const input = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'a personal question' } });
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
    expect(posted!.message).toBe('a personal question');
    jest.useRealTimers();
  });

  // Regression guard for the answer-routing fix (pollModeRef → pollSessionIdRef
  // under v2). Mode is chosen at the gate; the polled answer must STILL route
  // to the session that sent it. The canary being visible proves it routed to
  // the gate-chosen 3kok session.
  it('routes the polled answer to the gate-chosen 3kok session (answer-routing guard)', async () => {
    localStorage.clear();
    jest.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(jsonRes({ pendingId: 'p-route', status: 'pending' }, 202))
      .mockResolvedValueOnce(jsonRes({ status: 'answered', answer: 'Routed-to-3kok canary' }));

    const { container } = render(
      <FloatingChat pollMinMs={50} pollMaxMs={50} pollDurationMaxMs={60_000} />,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /ai chat/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /3 kingdoms/i }));
      fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Alex' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start chat/i }));
    });
    const input = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'route me' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
    });
    // Drive POST + the first scheduled poll (50ms).
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });
    // First poll returns answered.
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });
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
      fireEvent.click(screen.getByRole('button', { name: /ai chat/i }));
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
