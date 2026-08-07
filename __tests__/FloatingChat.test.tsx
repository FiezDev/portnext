import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import FloatingChat from '@/components/global/FloatingChat';

// The identity gate stands in front of the chat now. These suites exercise the
// conversation itself, so seed a returning visitor (the shape localStorage
// holds) instead of clicking through the gate in every test. Gate behaviour has
// its own tests in FloatingChat.test.tsx.
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

// --- Shared fetch mock ---------------------------------------------------
// jsdom has no global Response/Request, so we return a minimal plain object
// that quacks like a Response (only the fields the widget reads).
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

// --------------------------------------------------------------------------
// AC-T7-1: bubble renders, click opens panel, panel is an accessible dialog.
// --------------------------------------------------------------------------
describe('AC-T7-1 FloatingChat bubble + panel', () => {
  it('renders the floating button and opens the panel on click', async () => {
    render(<FloatingChat />);
    const bubble = screen.getByRole('button', { name: /ai chat/i });
    expect(bubble).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(bubble);
    });
    // The bubble reflects its open state on the toggle itself.
    expect(bubble).toHaveAttribute('aria-expanded', 'true');

    const dialog = await screen.findByRole('dialog', { name: /ai chat/i });
    expect(dialog).toBeInTheDocument();
    // Input is labeled.
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('closes the panel on Esc', async () => {
    render(<FloatingChat />);
    const bubble = screen.getByRole('button', { name: /ai chat/i });
    await act(async () => {
      fireEvent.click(bubble);
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await act(async () => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});

// --------------------------------------------------------------------------
// AC-T7-1 / T7-3: type → send → Awaiting → polled answer renders.
// --------------------------------------------------------------------------
describe('AC-T7-1 / AC-T7-3 send + poll flow', () => {
  it('shows Awaiting after send, then renders the answer + sources once answered', async () => {
    jest.useFakeTimers();
    fetchMock
      // POST /api/chat -> pending
      .mockResolvedValueOnce(jsonRes({ pendingId: 'p-1', status: 'pending' }, 202))
      // first poll: still pending
      .mockResolvedValueOnce(jsonRes({ status: 'pending' }))
      // second poll: answered
      .mockResolvedValueOnce(
        jsonRes({
          status: 'answered',
          answer: 'You can reach me at fiez@example.com',
          sources: [
            { title: 'Contact page', url: 'https://fiez.dev/contact' },
          ],
        }),
      );

    const { container } = render(
      <FloatingChat pollMinMs={50} pollMaxMs={50} pollDurationMaxMs={60_000} />,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /ai chat/i }));
    });

    const input = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'How do I contact you?' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
    });

    // Drive the POST microtask + the first scheduled poll (50ms).
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });

    // Awaiting indicator appears.
    await waitFor(() => {
      expect(screen.getByText(/awaiting/i)).toBeInTheDocument();
    });

    // Drive the second scheduled poll that returns the answer.
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });

    // Eventually the answer renders. T1: react-markdown + remark-gfm now
    // autolink the email in the answer, splitting it across <p>+<a> — use
    // toHaveTextContent (combined text) rather than getByText (single element).
    await waitFor(() => {
      expect(container).toHaveTextContent(/You can reach me at fiez@example.com/i);
    });
    // And the source citation.
    expect(screen.getByText('Contact page')).toBeInTheDocument();

    // POST was called once with client_request_id.
    const postCall = fetchMock.mock.calls.find(
      ([url, init]) =>
        String(url).includes('/api/chat') &&
        (init as RequestInit | undefined)?.method === 'POST',
    );
    expect(postCall).toBeDefined();
    const postedBody = JSON.parse(
      (postCall![1] as RequestInit).body as string,
    );
    expect(postedBody.client_request_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    // AC-T11-6: a per-send X-Correlation-Id header travels with the POST so the
    // sendback is traceable widget→Vercel→bot→line-gate.
    const postHeaders = new Headers(
      (postCall![1] as RequestInit).headers as Record<string, string>,
    );
    const correlationId = postHeaders.get('X-Correlation-Id');
    expect(correlationId).toBeTruthy();
    expect(correlationId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    jest.useRealTimers();
  });
});

// --------------------------------------------------------------------------
// AC-T7-5: K consecutive network/5xx failures -> Unavailable.
// --------------------------------------------------------------------------
describe('AC-T7-5 degradation to Unavailable', () => {
  it('flips to Unavailable after 5 consecutive network failures', async () => {
    jest.useFakeTimers();
    // POST succeeds; all subsequent polls reject (network).
    fetchMock
      .mockResolvedValueOnce(jsonRes({ pendingId: 'p-2', status: 'pending' }, 202))
      .mockRejectedValue(new TypeError('Failed to fetch'));

    render(
      <FloatingChat pollMinMs={20} pollMaxMs={20} pollDurationMaxMs={60_000} />,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /ai chat/i }));
    });
    const input = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'hi' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
    });

    // Advance timers to drive the polling loop through K failures.
    // Backoff doubles each failure (20, 40, 80, 160, 320, ...). Advance in
    // chunks that comfortably cover each scheduled poll; we need >=5 failures.
    for (let i = 0; i < 6; i++) {
      await act(async () => {
        jest.advanceTimersByTime(1000);
        // Let microtasks flush.
        await Promise.resolve();
      });
    }

    await waitFor(() => {
      expect(
        screen.getByText(/Chat unavailable/i),
      ).toBeInTheDocument();
    });
    jest.useRealTimers();
  });
});

// --------------------------------------------------------------------------
// [MED] Source-URL XSS hardening: a bot-sourced source URL is attacker-
// controllable. A `javascript:` URL must NOT be rendered as a clickable href.
// --------------------------------------------------------------------------
describe('[MED] FloatingChat source-URL XSS guard', () => {
  it('renders a safe https:// source as a link', async () => {
    jest.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(jsonRes({ pendingId: 'p-x', status: 'pending' }, 202))
      .mockResolvedValueOnce(
        jsonRes({
          status: 'answered',
          answer: 'see source',
          sources: [{ title: 'safe', url: 'https://fiez.dev/safe' }],
        }),
      );

    render(<FloatingChat pollMinMs={50} pollMaxMs={50} pollDurationMaxMs={60_000} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /ai chat/i }));
    });
    const input = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'q' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
    });
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });

    await waitFor(() => {
      const link = screen.queryByRole('link', { name: /safe/i });
      expect(link).not.toBeNull();
      expect((link as HTMLAnchorElement).href).toBe('https://fiez.dev/safe');
    });
    jest.useRealTimers();
  });

  it('does NOT render a javascript: source as a clickable href (renders as plain text)', async () => {
    jest.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(jsonRes({ pendingId: 'p-xss', status: 'pending' }, 202))
      .mockResolvedValueOnce(
        jsonRes({
          status: 'answered',
          answer: 'see evil',
          sources: [
            { title: 'evil', url: 'javascript:alert(document.cookie)' },
          ],
        }),
      );

    render(<FloatingChat pollMinMs={50} pollMaxMs={50} pollDurationMaxMs={60_000} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /ai chat/i }));
    });
    const input = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'q' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
    });
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });

    // Title text still renders...
    await waitFor(() => {
      expect(screen.getByText('evil')).toBeInTheDocument();
    });
    // ...but there is NO anchor link with the dangerous URL.
    const link = screen.queryByRole('link', { name: /evil/i });
    expect(link).toBeNull();
    jest.useRealTimers();
  });
});

// --------------------------------------------------------------------------
// Poll cadence: a gated answer lands ~10s after send (owner taps Approve, then
// ~9s of generation). Exponential backoff (3s -> 9s -> 21s) surfaces it up to
// 10s late, so pending polls hold a CONSTANT pollMinMs cadence — which also
// matches the /api/chat rate-limit refill of 1 token / 3s, so it can't 429.
// --------------------------------------------------------------------------
describe('poll cadence stays constant while pending', () => {
  it('schedules the next pending poll at pollMinMs, not double', async () => {
    jest.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(
        jsonRes({ pendingId: 'p-cadence', status: 'pending' }, 202),
      )
      .mockResolvedValue(jsonRes({ status: 'pending' }));

    render(
      <FloatingChat pollMinMs={50} pollMaxMs={5000} pollDurationMaxMs={60_000} />,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /ai chat/i }));
    });
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/message/i), {
        target: { value: 'ping' },
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
    });

    // POST + the first scheduled poll (50ms).
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // 60ms on, a constant cadence has polled again; a 2x backoff (100ms) has not.
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});

// AC-T3-1: one bubble opens to the personal bot.
describe('empty-state intro on the single bubble', () => {
  it('opens to the personal bot and shows its portfolio intro', async () => {
    const { container } = render(<FloatingChat />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /ai chat/i }));
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(container).toHaveTextContent(/work, stack, or availability/i);
  });
});

// --------------------------------------------------------------------------
// Identity gate + session persistence. Before this, the transcript lived only
// in React state and the proxy minted a new bot session per message, so a
// refresh lost the conversation and the bot had no multi-turn context.
// --------------------------------------------------------------------------
describe('identity gate and session persistence', () => {
  async function openBubble() {
    render(<FloatingChat />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /ai chat/i }));
    });
  }

  it('asks for a name before showing the composer on a first visit', async () => {
    localStorage.clear();
    await openBubble();
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^message$/i)).not.toBeInTheDocument();
  });

  it('will not start until the name is long enough', async () => {
    localStorage.clear();
    await openBubble();
    const start = screen.getByRole('button', { name: /start chat/i });
    expect(start).toBeDisabled();
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/your name/i), {
        target: { value: 'A' },
      });
    });
    expect(start).toBeDisabled();
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/your name/i), {
        target: { value: 'Alex' },
      });
    });
    expect(start).toBeEnabled();
  });

  it('reveals the composer after starting and remembers the name', async () => {
    localStorage.clear();
    await openBubble();
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/your name/i), {
        target: { value: 'Alex' },
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start chat/i }));
    });
    expect(screen.getByLabelText(/^message$/i)).toBeInTheDocument();
    expect(localStorage.getItem('concierge_session_v1')).toContain('Alex');
  });

  it('rehydrates a transcript from a resume code', async () => {
    localStorage.clear();
    fetchMock.mockResolvedValueOnce(
      jsonRes({
        messages: [
          { role: 'user', content: 'earlier question' },
          { role: 'assistant', content: 'earlier answer' },
        ],
      }),
    );
    await openBubble();
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/your name/i), {
        target: { value: 'Alex' },
      });
      fireEvent.change(screen.getByLabelText(/resume code/i), {
        target: { value: 'sess-abc' },
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start chat/i }));
    });
    await waitFor(() => {
      expect(screen.getByText('earlier answer')).toBeInTheDocument();
    });
    // The code is fetched through the same-origin proxy, never the bot directly.
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      '/api/chat?sessionId=sess-abc',
    );
    // And it becomes the resume code shown back to the visitor.
    expect(screen.getByText('sess-abc')).toBeInTheDocument();
  });

  it('reports a resume code that does not match anything', async () => {
    localStorage.clear();
    fetchMock.mockResolvedValueOnce(jsonRes({ status: 'error' }, 404));
    await openBubble();
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/your name/i), {
        target: { value: 'Alex' },
      });
      fireEvent.change(screen.getByLabelText(/resume code/i), {
        target: { value: 'nope' },
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start chat/i }));
    });
    expect(screen.getByRole('alert')).toHaveTextContent(/did not match/i);
    // Still gated — a failed resume must not silently start a fresh chat.
    expect(screen.queryByLabelText(/^message$/i)).not.toBeInTheDocument();
  });
});
