import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import FloatingChat from '@/components/global/FloatingChat';

// --- v2 multi-session storage helpers ------------------------------------
// Storage migrated from ONE session object to a LIST of single-bot
// conversations. localStorage now holds:
//   concierge_sessions_v2        -> Session[] ({id, displayName, mode,
//                                          sessionId, messages, createdAt,
//                                          updatedAt})
//   concierge_active_session_v2  -> the active session id (string)
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; url: string }[];
}
type Mode = 'personal' | '3kok';
interface Session {
  id: string;
  displayName: string;
  mode: Mode;
  sessionId: string | null;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

function makeSession(opts: Partial<Session> & { displayName?: string } = {}): Session {
  const now = 1_700_000_000_000; // deterministic timestamp for stable date labels
  return {
    id: opts.id ?? 's-' + Math.random().toString(36).slice(2, 8),
    displayName: opts.displayName ?? 'Tester',
    mode: opts.mode ?? 'personal',
    sessionId: opts.sessionId ?? null,
    messages: opts.messages ?? [],
    createdAt: opts.createdAt ?? now,
    updatedAt: opts.updatedAt ?? now,
  };
}

function seedSessions(sessions: Session[], activeId?: string | null) {
  localStorage.setItem('concierge_sessions_v2', JSON.stringify(sessions));
  const aid = activeId !== undefined ? activeId : (sessions[0]?.id ?? null);
  if (aid) localStorage.setItem('concierge_active_session_v2', aid);
  else localStorage.removeItem('concierge_active_session_v2');
}

// Seed a returning visitor: one personal session, active. (Was a v1 object;
// now a v2 Session[].)
function seedReturningVisitor(name = 'Tester') {
  const s = makeSession({ displayName: name, mode: 'personal' });
  seedSessions([s], s.id);
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

function postedBody(): Record<string, unknown> | undefined {
  const postCall = fetchMock.mock.calls.find(
    ([url, init]) =>
      String(url).includes('/api/chat') &&
      (init as RequestInit | undefined)?.method === 'POST',
  );
  if (!postCall) return undefined;
  return JSON.parse((postCall[1] as RequestInit).body as string);
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

  it('reveals the composer after starting and remembers the name (v2 session)', async () => {
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
    // v2: a Session[] is written, with an entry whose displayName is 'Alex'.
    const stored = JSON.parse(
      localStorage.getItem('concierge_sessions_v2') || '[]',
    ) as Session[];
    expect(stored.length).toBe(1);
    expect(stored[0].displayName).toBe('Alex');
    expect(localStorage.getItem('concierge_active_session_v2')).toBe(
      stored[0].id,
    );
  });

  it('rehydrates a transcript from a resume code into a new session', async () => {
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
    // v2: a session was created carrying the resume code as its sessionId.
    const stored = JSON.parse(
      localStorage.getItem('concierge_sessions_v2') || '[]',
    ) as Session[];
    expect(stored.some((s) => s.sessionId === 'sess-abc')).toBe(true);
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

// --------------------------------------------------------------------------
// Multi-session (v2). Storage is now a LIST of single-bot conversations; the
// gate/menu shows a dropdown to resume any saved one, and the "start new chat"
// form creates a fresh session. v1 conversations are migrated on first load.
// --------------------------------------------------------------------------
describe('multi-session (v2)', () => {
  // --- MIGRATION: v1 object → v2 Session[] (one entry per mode with msgs) ---
  describe('v1 → v2 migration', () => {
    it('builds one v2 session per mode that has messages, preserves transcripts, removes v1', async () => {
      localStorage.clear();
      // v1 visitor with both personal + 3kok history.
      localStorage.setItem(
        'concierge_session_v1',
        JSON.stringify({
          displayName: 'Legacy',
          sessionId: { personal: 'p-leg', '3kok': 'k-leg' },
          messages: {
            personal: [{ id: 'm1', role: 'user', content: 'hello personal' }],
            '3kok': [
              { id: 'm2', role: 'assistant', content: 'hello 3kok answer' },
            ],
          },
          mode: 'personal',
        }),
      );

      const { container } = render(<FloatingChat />);
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /ai chat/i }));
      });

      // v2 written with 2 entries; v1 gone.
      const stored = JSON.parse(
        localStorage.getItem('concierge_sessions_v2') || '[]',
      ) as Session[];
      expect(stored.length).toBe(2);
      expect(localStorage.getItem('concierge_session_v1')).toBeNull();
      // Conversations intact: the personal entry (active per v1.mode) loaded.
      expect(stored.some((s) => s.mode === 'personal')).toBe(true);
      expect(stored.some((s) => s.mode === '3kok')).toBe(true);
      // Resume codes preserved.
      expect(stored.find((s) => s.mode === 'personal')!.sessionId).toBe(
        'p-leg',
      );
      expect(stored.find((s) => s.mode === '3kok')!.sessionId).toBe('k-leg');
      // Active = the personal session (v1.mode='personal'), chat is shown with
      // its transcript.
      expect(container).toHaveTextContent('hello personal');
    });

    it('creates no entries when v1 has no messages', async () => {
      localStorage.clear();
      localStorage.setItem(
        'concierge_session_v1',
        JSON.stringify({
          displayName: 'Empty',
          sessionId: { personal: null, '3kok': null },
          messages: { personal: [], '3kok': [] },
          mode: 'personal',
        }),
      );
      render(<FloatingChat />);
      // No v2 sessions, and the gate is up (no active session).
      expect(localStorage.getItem('concierge_sessions_v2')).toBe('[]');
      // v1 was consumed (migration ran even though it yielded nothing).
      expect(localStorage.getItem('concierge_session_v1')).toBeNull();
    });
  });

  // --- NEW SESSION: fresh → gate → 3-Kingdom → start → session created ---
  describe('start new chat creates a session', () => {
    it('creates a 3kok session on start, then send posts mode:"3kok" into it', async () => {
      localStorage.clear();
      jest.useFakeTimers();
      fetchMock.mockResolvedValueOnce(
        jsonRes({ pendingId: 'p-new', status: 'pending' }, 202),
      );

      render(
        <FloatingChat pollMinMs={50} pollMaxMs={50} pollDurationMaxMs={60_000} />,
      );
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /ai chat/i }));
      });
      // Fresh visit: no saved sessions → no dropdown.
      expect(screen.queryByLabelText(/resume a conversation/i)).not.toBeInTheDocument();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /3 kingdoms/i }));
      });
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/your name/i), {
          target: { value: 'Cara' },
        });
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /start chat/i }));
      });

      // A 3kok session named Cara was created and made active.
      const stored = JSON.parse(
        localStorage.getItem('concierge_sessions_v2') || '[]',
      ) as Session[];
      expect(stored.length).toBe(1);
      expect(stored[0].displayName).toBe('Cara');
      expect(stored[0].mode).toBe('3kok');
      expect(localStorage.getItem('concierge_active_session_v2')).toBe(
        stored[0].id,
      );

      // Send → POST mode=3kok.
      const input = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
      await act(async () => {
        fireEvent.change(input, { target: { value: 'new q' } });
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

      // The user message landed in the active session.
      const storedAfter = JSON.parse(
        localStorage.getItem('concierge_sessions_v2') || '[]',
      ) as Session[];
      expect(
        storedAfter[0].messages.some((m) => m.content === 'new q'),
      ).toBe(true);

      jest.useRealTimers();
    });
  });

  // --- DROPDOWN RESUME: pick a saved session, conversation swaps to it ---
  describe('dropdown resume', () => {
    it('lists saved sessions labeled name · bot · date, and selecting one swaps the conversation', async () => {
      const s1 = makeSession({
        id: 's-alice',
        displayName: 'Alice',
        mode: 'personal',
        messages: [{ id: 'a1', role: 'user', content: 'alice message' }],
      });
      const s2 = makeSession({
        id: 's-bob',
        displayName: 'Bob',
        mode: '3kok',
        messages: [{ id: 'b1', role: 'assistant', content: 'bob message' }],
      });
      seedSessions([s1, s2], s1.id);

      render(<FloatingChat />);
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /ai chat/i }));
      });
      // Active = s1 (Alice) → its message is visible.
      expect(screen.getByText('alice message')).toBeInTheDocument();

      // ← Menu.
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /back to menu/i }));
      });
      // Dropdown visible with both sessions, labeled correctly.
      const select = screen.getByLabelText(/resume a conversation/i) as HTMLSelectElement;
      const options = Array.from(select.options).map((o) => o.textContent || '');
      expect(options.some((t) => /Alice.*Personal/.test(t))).toBe(true);
      expect(options.some((t) => /Bob.*3-Kingdom/.test(t))).toBe(true);

      // Select Bob → conversation swaps.
      await act(async () => {
        fireEvent.change(select, { target: { value: 's-bob' } });
      });
      await waitFor(() => {
        expect(screen.getByText('bob message')).toBeInTheDocument();
      });
      expect(screen.queryByText('alice message')).not.toBeInTheDocument();
      // Active id persisted.
      expect(localStorage.getItem('concierge_active_session_v2')).toBe('s-bob');
    });
  });

  // --- BACK-TO-MENU + SWITCH: from one chat, switch to another saved session.
  describe('back-to-menu + switch sessions', () => {
    it('from an active chat, ← Menu → dropdown → pick another → chat swaps', async () => {
      const s1 = makeSession({
        id: 's-one',
        displayName: 'Winnie',
        mode: 'personal',
        messages: [{ id: 'w1', role: 'user', content: 'winnie says hi' }],
      });
      const s2 = makeSession({
        id: 's-two',
        displayName: 'Piglet',
        mode: '3kok',
        messages: [{ id: 'p1', role: 'user', content: 'piglet says hello' }],
      });
      seedSessions([s1, s2], s1.id);

      render(<FloatingChat />);
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /ai chat/i }));
      });
      expect(screen.getByText('winnie says hi')).toBeInTheDocument();

      // ← Menu → dropdown → pick Piglet.
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /back to menu/i }));
      });
      const select = screen.getByLabelText(/resume a conversation/i);
      await act(async () => {
        fireEvent.change(select, { target: { value: 's-two' } });
      });
      await waitFor(() => {
        expect(screen.getByText('piglet says hello')).toBeInTheDocument();
      });
      expect(screen.queryByText('winnie says hi')).not.toBeInTheDocument();
    });
  });

  // --- Regression: polled answer routes to the active session that SENT it ---
  // (the multi-session successor to the pollModeRef fix). If the active session
  // sent and stayed active, the answer must land in its transcript.
  describe('answer routing into the active session', () => {
    it('appends the polled answer to the active session that sent the message', async () => {
      jest.useFakeTimers();
      const s1 = makeSession({
        id: 's-route',
        displayName: 'Router',
        mode: '3kok',
        messages: [],
      });
      seedSessions([s1], s1.id);
      fetchMock
        .mockResolvedValueOnce(
          jsonRes({ pendingId: 'p-route2', status: 'pending' }, 202),
        )
        .mockResolvedValueOnce(
          jsonRes({ status: 'answered', answer: 'routed-canary' }),
        );

      const { container } = render(
        <FloatingChat pollMinMs={50} pollMaxMs={50} pollDurationMaxMs={60_000} />,
      );
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /ai chat/i }));
      });
      const input = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
      await act(async () => {
        fireEvent.change(input, { target: { value: 'route me' } });
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /send/i }));
      });
      // POST + first poll (answered).
      await act(async () => {
        jest.advanceTimersByTime(60);
        await Promise.resolve();
      });
      await act(async () => {
        jest.advanceTimersByTime(60);
        await Promise.resolve();
      });
      await waitFor(() => {
        expect(container).toHaveTextContent('routed-canary');
      });
      // Persisted into the active session.
      const stored = JSON.parse(
        localStorage.getItem('concierge_sessions_v2') || '[]',
      ) as Session[];
      expect(
        stored[0].messages.some((m) => m.content === 'routed-canary'),
      ).toBe(true);
      jest.useRealTimers();
    });
  });
});

// --------------------------------------------------------------------------
// Back-to-menu from inside chat: returns to the menu (dropdown + new-chat
// form) so a visitor can switch sessions or start a new one in another bot.
// --------------------------------------------------------------------------
describe('back-to-menu control (open menu / switch bot from inside chat)', () => {
  it('returns to the menu (name pre-filled, bot toggle present) then a 3-Kingdom start creates a new 3kok session', async () => {
    jest.useFakeTimers();
    const s = makeSession({ displayName: 'Tester', mode: 'personal' });
    seedSessions([s], s.id);
    // POST -> pending for the send after re-entering; remaining calls pending.
    fetchMock
      .mockResolvedValueOnce(jsonRes({ pendingId: 'p-menu', status: 'pending' }, 202))
      .mockResolvedValue(jsonRes({ status: 'pending' }));

    render(<FloatingChat pollMinMs={50} pollMaxMs={50} pollDurationMaxMs={60_000} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /ai chat/i }));
    });

    // Chat is shown (NOT the gate): the Message composer is present...
    expect(screen.getByLabelText(/^message$/i)).toBeInTheDocument();
    // ...and the gate's name input is NOT.
    expect(screen.queryByLabelText(/your name/i)).not.toBeInTheDocument();

    // Click the back-to-menu control in the panel header.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /back to menu/i }));
    });

    // The menu re-appears: name input present AND pre-filled with the name...
    const nameInput = screen.getByLabelText(/your name/i) as HTMLInputElement;
    expect(nameInput).toBeInTheDocument();
    expect(nameInput.value).toBe('Tester');
    // ...and the bot toggle group is there, with Personal pre-selected.
    const botGroup = screen.getByRole('group', { name: /bot/i });
    expect(botGroup).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /personal/i }),
    ).toHaveAttribute('aria-pressed', 'true');
    // The Message composer is gone while at the menu.
    expect(screen.queryByLabelText(/^message$/i)).not.toBeInTheDocument();

    // Switch to the 3-Kingdom bot and Start -> creates a NEW 3kok session and
    // returns to chat in it.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /3 kingdoms/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start chat/i }));
    });
    const messageInput = await waitFor(() =>
      screen.getByLabelText(/^message$/i),
    );
    expect(messageInput).toBeInTheDocument();

    // Type + send; assert the POST body carries mode === '3kok'.
    await act(async () => {
      fireEvent.change(messageInput, { target: { value: 'hello' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
      await Promise.resolve();
    });
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });

    const posted = postedBody();
    expect(posted).toBeDefined();
    expect(posted!.mode).toBe('3kok');

    jest.useRealTimers();
  });
});
