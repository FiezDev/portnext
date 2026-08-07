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
// Same shape as __tests__/FloatingChat.test.tsx — jsdom has no global
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

const MD_CONTENT = '**hi**\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n- x';

beforeEach(() => {
  localStorage.clear();
  seedReturningVisitor();
  fetchMock = jest.fn() as unknown as FetchMock;
  (globalThis as { fetch: unknown }).fetch = fetchMock;
  // Default: any unplanned poll returns pending (no answer).
  fetchMock.mockResolvedValue(jsonRes({ status: 'pending' }));
  jest.useRealTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// Helper: open the panel, type into the composer, click send.
async function sendUserMessage(text: string) {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /ai chat/i }));
  });
  const input = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
  await act(async () => {
    fireEvent.change(input, { target: { value: text } });
  });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
  });
}

// --------------------------------------------------------------------------
// AC-T1-1: ASSISTANT messages render structured markdown (strong/table/li).
// --------------------------------------------------------------------------
describe('AC-T1-1 assistant message renders markdown', () => {
  it('parses **bold**, a GFM table, and a list item', async () => {
    jest.useFakeTimers();
    fetchMock
      // POST /api/chat -> pending
      .mockResolvedValueOnce(jsonRes({ pendingId: 'p-md', status: 'pending' }, 202))
      // first poll: still pending
      .mockResolvedValueOnce(jsonRes({ status: 'pending' }))
      // second poll: answered with markdown
      .mockResolvedValueOnce(
        jsonRes({ status: 'answered', answer: MD_CONTENT }),
      );

    const { container } = render(
      <FloatingChat pollMinMs={50} pollMaxMs={50} pollDurationMaxMs={60_000} />,
    );

    await sendUserMessage('q');

    // Drive POST microtask + first scheduled poll (50ms).
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });
    // Drive the second scheduled poll that returns the answer.
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(container.querySelector('strong')).not.toBeNull();
    });

    // Bold parsed.
    expect(container.querySelector('strong')?.textContent).toBe('hi');
    // GFM table parsed.
    expect(container.querySelector('table')).not.toBeNull();
    expect(container.querySelector('th')?.textContent).toBe('a');
    expect(container.querySelector('td')?.textContent).toBe('1');
    // List parsed.
    expect(container.querySelector('li')?.textContent).toBe('x');

    jest.useRealTimers();
  });
});

// --------------------------------------------------------------------------
// AC-T1-2: USER messages stay PLAIN text (XSS — never parse user input).
// --------------------------------------------------------------------------
describe('AC-T1-2 user message is not parsed as markdown', () => {
  it('renders the raw literal text with no <strong>/<table>/<li>', async () => {
    jest.useFakeTimers();
    // POST returns pending; we don't care about the answer for this assertion.
    fetchMock.mockResolvedValueOnce(
      jsonRes({ pendingId: 'p-u', status: 'pending' }, 202),
    );

    const { container } = render(
      <FloatingChat pollMinMs={50} pollMaxMs={50} pollDurationMaxMs={60_000} />,
    );

    await sendUserMessage(MD_CONTENT);

    // Let the POST microtask settle.
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });

    // No markdown elements rendered.
    expect(container.querySelector('strong')).toBeNull();
    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelector('li')).toBeNull();
    // The raw literal text is shown verbatim (XSS-safe).
    expect(container.textContent).toContain('**hi**');

    jest.useRealTimers();
  });
});

// --------------------------------------------------------------------------
// AC-T1-3: a markdown link with href="javascript:..." is rendered as an
// inert <span> (reuses isSafeUrl). No <a href="javascript:..."> leaks.
// --------------------------------------------------------------------------
describe('AC-T1-3 javascript: URL is rendered inert', () => {
  it('renders [evil](javascript:alert(1)) without a clickable anchor', async () => {
    jest.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(jsonRes({ pendingId: 'p-js', status: 'pending' }, 202))
      .mockResolvedValueOnce(
        jsonRes({
          status: 'answered',
          answer: '[evil](javascript:alert(1))',
        }),
      );

    const { container } = render(
      <FloatingChat pollMinMs={50} pollMaxMs={50} pollDurationMaxMs={60_000} />,
    );

    await sendUserMessage('q');

    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });
    await act(async () => {
      jest.advanceTimersByTime(60);
      await Promise.resolve();
    });

    // The link label still renders as text.
    await waitFor(() => {
      expect(screen.getByText('evil')).toBeInTheDocument();
    });

    // No anchor with a javascript: href (the isSafeUrl guard fired).
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
    // The label is wrapped in a span, not an anchor.
    expect(container.querySelectorAll('a').length).toBe(0);

    jest.useRealTimers();
  });
});
