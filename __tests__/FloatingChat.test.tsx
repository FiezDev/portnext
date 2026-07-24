import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import FloatingChat from '@/components/global/FloatingChat';

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
    const bubble = screen.getByRole('button', { name: /chat with fiez/i });
    expect(bubble).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(bubble);
    });

    const dialog = await screen.findByRole('dialog', { name: /chat with fiez/i });
    expect(dialog).toBeInTheDocument();
    // Input is labeled.
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('closes the panel on Esc', async () => {
    render(<FloatingChat />);
    const bubble = screen.getByRole('button', { name: /chat with fiez/i });
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

    render(
      <FloatingChat pollMinMs={50} pollMaxMs={50} pollDurationMaxMs={60_000} />,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /chat with fiez/i }));
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

    // Eventually the answer renders.
    await waitFor(() => {
      expect(
        screen.getByText(/You can reach me at fiez@example.com/i),
      ).toBeInTheDocument();
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
      fireEvent.click(screen.getByRole('button', { name: /chat with fiez/i }));
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
