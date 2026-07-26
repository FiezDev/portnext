'use client';

// AC-T7-1..6 — FloatingChat widget
//
// Revives the old Livechat shell (glass panel, fixed position, DebounceInput,
// FontAwesome + Imgix icons) but wires it to a REAL state machine that talks
// same-origin to /api/chat (which proxies the portfolio bot). No bot secret
// ever touches the browser.

import { faClose, faPaperPlane, faWindowMinimize } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DebounceInput } from 'react-debounce-input';

// --- Constants (AC-T7-5) -------------------------------------------------
const MAX_POLL_FAILURES = 5; // K consecutive network/5xx failures -> Unavailable
const POLL_MIN_MS = 3000; // backoff floor
const POLL_MAX_MS = 15000; // backoff ceiling
const POLL_DURATION_MAX_MS = 10 * 60 * 1000; // ~10 min total client budget

// --- Component props -----------------------------------------------------
interface FloatingChatProps {
  /** Override the base poll interval — used by tests to avoid multi-second waits. */
  pollMinMs?: number;
  /** Override the poll ceiling — used by tests. */
  pollMaxMs?: number;
  /** Override the total polling budget — used by tests. */
  pollDurationMaxMs?: number;
}

// --- Types ---------------------------------------------------------------
type ChatStatus =
  | 'closed'
  | 'open'
  | 'composing'
  | 'awaiting'
  | 'answered'
  | 'declined'
  | 'expired'
  | 'error'
  | 'unavailable';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; url: string }[];
}

interface PendingResponse {
  pendingId?: string;
  status: string;
}

interface StatusResponse {
  status: string;
  answer?: string;
  sources?: { title: string; url: string }[];
}

// MED review fix: a bot-sourced source URL is attacker-controllable. Only
// render it as a clickable href if it's an absolute http(s) URL — otherwise
// drop the link and render the title as plain text (defends against
// javascript: / data: URL execution from a compromised or hostile bot).
function isSafeUrl(u: string): boolean {
  try {
    const parsed = new URL(u);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// Tiny UUID v4 — avoids pulling a dep and works in all modern browsers.
function uuid(): string {
  const c = globalThis.crypto as
    | { randomUUID?: () => string; getRandomValues?: (a: Uint8Array) => Uint8Array }
    | undefined;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  const bytes = new Uint8Array(16);
  if (c && typeof c.getRandomValues === 'function') {
    c.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex
    .slice(6, 8)
    .join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
}

function nextBackoff(prev: number): number {
  // Exponential 3s -> 15s.
  const doubled = prev * 2;
  return Math.min(Math.max(doubled, POLL_MIN_MS), POLL_MAX_MS);
}

// --- Component -----------------------------------------------------------
const FloatingChat = ({
  pollMinMs = POLL_MIN_MS,
  pollMaxMs = POLL_MAX_MS,
  pollDurationMaxMs = POLL_DURATION_MAX_MS,
}: FloatingChatProps) => {
  const reducedMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ChatStatus>('open');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Polling refs (kept off React state to avoid re-render churn).
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollStartRef = useRef<number>(0);
  const failCountRef = useRef<number>(0);
  const pollPendingIdRef = useRef<string | null>(null);
  const clientIdRef = useRef<string | null>(null);
  const abortedRef = useRef<boolean>(false);

  const messageListRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the message list to the bottom whenever it changes.
  useEffect(() => {
    const node = messageListRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, status]);

  // Esc closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const stopPolling = useCallback(() => {
    abortedRef.current = true;
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  // Cleanup on unmount.
  useEffect(() => stopPolling, [stopPolling]);

  // AC-T7-5: poll the pending endpoint with exponential backoff. Flips to
  // Unavailable after K consecutive network/5xx failures; flips to Expired
  // after POLL_DURATION_MAX_MS total wall-clock.
  const pollOnce = useCallback(
    async (pendingId: string, delayMs: number) => {
      if (abortedRef.current) return;
      if (Date.now() - pollStartRef.current > pollDurationMaxMs) {
        setStatus('expired');
        stopPolling();
        return;
      }
      const schedule = (d: number) => {
        if (abortedRef.current) return;
        pollTimerRef.current = setTimeout(() => pollOnce(pendingId, d), d);
      };

      let res: Response;
      try {
        res = await fetch(`/api/chat?pendingId=${encodeURIComponent(pendingId)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch {
        failCountRef.current += 1;
        if (failCountRef.current >= MAX_POLL_FAILURES) {
          setStatus('unavailable');
          stopPolling();
        } else {
          schedule(Math.min(delayMs * 2, pollMaxMs));
        }
        return;
      }

      // 4xx is a hard error (bad request), NOT a retryable failure.
      if (res.status >= 400 && res.status < 500) {
        setStatus('error');
        stopPolling();
        return;
      }
      // 5xx counts as a retryable failure.
      if (res.status >= 500 || !res.ok) {
        failCountRef.current += 1;
        if (failCountRef.current >= MAX_POLL_FAILURES) {
          setStatus('unavailable');
          stopPolling();
        } else {
          schedule(Math.min(delayMs * 2, pollMaxMs));
        }
        return;
      }

      // 2xx — parse + map.
      failCountRef.current = 0;
      let body: StatusResponse;
      try {
        body = (await res.json()) as StatusResponse;
      } catch {
        schedule(pollMinMs);
        return;
      }
      const s = body?.status;
      if (s === 'answered' && typeof body.answer === 'string') {
        setMessages((prev) => [
          ...prev,
          {
            id: uuid(),
            role: 'assistant',
            content: body.answer as string,
            sources: Array.isArray(body.sources) ? body.sources : undefined,
          },
        ]);
        setStatus('answered');
        stopPolling();
        return;
      }
      if (s === 'declined') {
        setStatus('declined');
        stopPolling();
        return;
      }
      if (s === 'expired') {
        setStatus('expired');
        stopPolling();
        return;
      }
      // still pending -> keep polling with backoff.
      schedule(Math.min(nextBackoff(delayMs), pollMaxMs));
    },
    [stopPolling, pollDurationMaxMs, pollMaxMs, pollMinMs],
  );

  const startAwaiting = useCallback(
    (pendingId: string) => {
      abortedRef.current = false;
      pollStartRef.current = Date.now();
      failCountRef.current = 0;
      pollPendingIdRef.current = pendingId;
      setStatus('awaiting');
      // First poll after the minimum interval.
      pollTimerRef.current = setTimeout(
        () => pollOnce(pendingId, pollMinMs),
        pollMinMs,
      );
    },
    [pollOnce],
  );

  // AC-T7-6: send -> POST /api/chat. A retried POST with the same
  // client_request_id is forwarded verbatim (the bot dedupes).
  const send = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || status === 'awaiting' || status === 'composing') return;

    const clientRequestId = uuid();
    clientIdRef.current = clientRequestId;

    const userMsg: ChatMessage = {
      id: clientRequestId,
      role: 'user',
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setDraft('');
    setStatus('composing');

    // AC-T11-6: a per-send correlation id propagates widget→Vercel→bot→line-gate
    // so a single sendback can be traced across all three services' logs.
    const correlationId = uuid();

    let res: Response;
    try {
      res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-Id': correlationId,
        },
        body: JSON.stringify({
          message: trimmed,
          mode: '3kok',
          client_request_id: clientRequestId,
        }),
      });
    } catch {
      setStatus('unavailable');
      return;
    }

    if (!res.ok && res.status !== 202) {
      setStatus('error');
      return;
    }
    let body: PendingResponse;
    try {
      body = (await res.json()) as PendingResponse;
    } catch {
      setStatus('error');
      return;
    }
    if (!body?.pendingId) {
      setStatus('error');
      return;
    }
    startAwaiting(body.pendingId);
  }, [draft, status, startAwaiting]);

  // --- Render ------------------------------------------------------------
  const openTransition = useMemo(
    () =>
      reducedMotion
        ? ({ duration: 0 } as const)
        : ({ type: 'spring', stiffness: 300, damping: 26 } as const),
    [reducedMotion],
  );

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        aria-label="Chat with Fiez"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-[200] flex h-14 w-14 items-center justify-center rounded-full bg-head text-white shadow-lg shadow-black/30 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <FontAwesomeIcon icon={faPaperPlane} className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.section
            key="panel"
            role="dialog"
            aria-label="Chat with Fiez"
            aria-live="polite"
            aria-modal="false"
            className="glass fixed bottom-36 right-4 md:bottom-40 md:right-6 z-[200] flex h-[500px] w-[min(92vw,360px)] flex-col rounded-2xl border border-white/20 p-3 text-white"
            initial={reducedMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
            transition={openTransition}
          >
            {/* Header */}
            <header className="flex items-center justify-between border-b border-white/15 pb-2">
              <span className="text-sm font-semibold tracking-wide">
                Chat with Fiez
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Minimize chat"
                  onClick={() => setOpen(false)}
                  className="text-white/80 hover:text-white"
                >
                  <FontAwesomeIcon icon={faWindowMinimize} className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Close chat"
                  onClick={() => {
                    setOpen(false);
                  }}
                  className="text-white/80 hover:text-white"
                >
                  <FontAwesomeIcon icon={faClose} className="h-4 w-4" />
                </button>
              </div>
            </header>

            {/* Message list */}
            <div
              ref={messageListRef}
              aria-live="polite"
              className="flex grow flex-col gap-2 overflow-y-auto py-2"
            >
              {messages.length === 0 && (
                <p className="m-auto text-center text-sm text-white/60">
                  Ask me anything about my work, stack, or availability.
                </p>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.role === 'user'
                      ? 'self-end max-w-[80%] rounded-lg bg-head/80 px-2 py-1 text-sm'
                      : 'self-start max-w-[85%] rounded-lg bg-white/10 px-2 py-1 text-sm'
                  }
                >
                  {m.role === 'user' ? (
                    // USER input is NEVER parsed as markdown (XSS). Plain text only.
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    // ASSISTANT answers render structured markdown. The isSafeUrl
                    // guard reuses the same check as the source-citation branch
                    // — a javascript:/data: URL collapses to an inert <span>.
                    <div className="chat-md">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ href, children }) =>
                            isSafeUrl(href ?? '')
                              ? (
                                <a href={href} target="_blank" rel="noreferrer">
                                  {children}
                                </a>
                              )
                              : <span>{children}</span>,
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  {m.sources && m.sources.length > 0 && (
                    <ul className="mt-1 flex flex-col gap-0.5">
                      {m.sources.map((s, i) => {
                        const safe = typeof s.url === 'string' && isSafeUrl(s.url);
                        return (
                          <li
                            key={`${s.url}-${i}`}
                            className={safe ? 'text-xs underline' : 'text-xs'}
                          >
                            {safe ? (
                              <a
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {s.title}
                              </a>
                            ) : (
                              <span>{s.title}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ))}

              {status === 'awaiting' && (
                <p
                  className="self-start rounded-lg bg-white/10 px-2 py-1 text-sm text-white/80"
                  data-testid="awaiting-indicator"
                >
                  Awaiting Fiez&apos;s reply…
                </p>
              )}
              {status === 'unavailable' && (
                <p className="self-start rounded-lg bg-red-500/20 px-2 py-1 text-sm">
                  Chat unavailable — Fiez may be offline
                </p>
              )}
              {status === 'expired' && (
                <p className="self-start rounded-lg bg-amber-500/20 px-2 py-1 text-sm">
                  This reply took too long — please try again later.
                </p>
              )}
              {status === 'declined' && (
                <p className="self-start rounded-lg bg-amber-500/20 px-2 py-1 text-sm">
                  Fiez declined to answer this one.
                </p>
              )}
              {status === 'error' && (
                <p className="self-start rounded-lg bg-red-500/20 px-2 py-1 text-sm">
                  Something went wrong. Please try again.
                </p>
              )}
            </div>

            {/* Composer */}
            <div className="flex items-end gap-2 border-t border-white/15 pt-2">
              <label htmlFor="floating-chat-input" className="sr-only">
                Message
              </label>
              <DebounceInput
                element="textarea"
                debounceTimeout={0}
                id="floating-chat-input"
                name="message"
                aria-label="Message"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Type a message…  (Enter to send, Shift+Enter for newline)"
                rows={1}
                className="max-h-28 min-h-[44px] w-full resize-none rounded-lg bg-white/10 p-2 text-sm text-white placeholder-white/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
              />
              <button
                type="button"
                aria-label="Send"
                disabled={status === 'awaiting' || status === 'composing'}
                onClick={() => void send()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-head text-white disabled:opacity-40"
              >
                <FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" />
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChat;
