'use client';

// AC-T7-1..6 — FloatingChat widget
//
// Revives the old Livechat shell (glass panel, fixed position, DebounceInput,
// FontAwesome + Imgix icons) but wires it to a REAL state machine that talks
// same-origin to /api/chat (which proxies the portfolio bot). No bot secret
// ever touches the browser.

import {
  faClose,
  faPaperPlane,
  faScroll,
  faShieldHalved,
  faUser,
  faWindowMinimize,
} from '@fortawesome/free-solid-svg-icons';
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
  // AC-T2-1: per-FAB mode (no localStorage — each open is a fresh
  // session in that mode). 'personal' = Artemis, '3kok' = สามก๊ก.
  const [mode, setMode] = useState<'personal' | '3kok'>('personal');
  // Per-mode message history: each bot keeps its OWN list. Switching FAB
  // swaps the visible list — no leak, no loss (the bug where chatting with
  // Artemis then opening สามก๊ก showed Artemis's history).
  const [messagesByMode, setMessagesByMode] = useState<
    Record<'personal' | '3kok', ChatMessage[]>
  >({ personal: [], '3kok': [] });
  // Derived: the active mode's history. All reads (render, auto-scroll dep)
  // go through this, so swapping `mode` swaps the visible list automatically.
  const messages = messagesByMode[mode];
  // AC-T3-1..2: dismissable consent notice. Persists per-browser via
  // localStorage so a visitor who closed it doesn't see it again on reload.
  const [consentDismissed, setConsentDismissed] = useState(
    () =>
      typeof localStorage !== 'undefined' &&
      localStorage.getItem('concierge_consent_dismissed') === '1',
  );

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
        // Append the assistant answer to the mode that SENT the request.
        // `mode` is captured in this closure (pollOnce has `mode` in its
        // deps), and the scheduled timer retains the originating instance,
        // so even a mid-poll mode-switch routes the answer to the right bot.
        setMessagesByMode((prev) => ({
          ...prev,
          [mode]: [
            ...prev[mode],
            {
              id: uuid(),
              role: 'assistant',
              content: body.answer as string,
              sources: Array.isArray(body.sources) ? body.sources : undefined,
            },
          ],
        }));
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
      // Still pending -> keep a CONSTANT cadence. A gated answer lands ~10s
      // after send (owner taps Approve, then ~9s of generation); exponential
      // backoff (3s -> 9s -> 21s) surfaced it up to 10s late. pollMinMs (3s)
      // also equals the /api/chat rate-limit refill (1 token / 3s), so a
      // steady poll can never trip its own 429.
      schedule(pollMinMs);
    },
    [stopPolling, pollDurationMaxMs, pollMaxMs, pollMinMs, mode],
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
    setMessagesByMode((prev) => ({ ...prev, [mode]: [...prev[mode], userMsg] }));
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
          mode,
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
  }, [draft, status, startAwaiting, mode]);

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
      {/* Two themed entry FABs (AC-T2-1): Artemis = personal advisor,
          สามก๊ก = Three-Kingdoms scholar. Each FAB pins the panel to its
          mode; clicking the active bot's FAB toggles the panel, clicking
          the other switches mode + opens. No localStorage (stress fix). */}
      <div className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-[200] flex flex-col gap-2">
        <button
          type="button"
          aria-label="Chat with Artemis"
          onClick={() => {
            // Switching bots (not toggling the same one) resets status so an
            // 'awaiting'/'answered' state from the other bot doesn't bleed
            // into the freshly opened chat.
            if (mode !== 'personal') setStatus('open');
            setMode('personal');
            setOpen((v) => (mode === 'personal' ? !v : true));
          }}
          aria-expanded={open && mode === 'personal'}
          aria-haspopup="dialog"
          className={`flex h-14 w-14 items-center justify-center rounded-full border shadow-lg shadow-black/30 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            open && mode === 'personal'
              ? 'border-accent bg-accent text-black'
              : 'border-accent/40 bg-black text-accent'
          }`}
        >
          <FontAwesomeIcon icon={faUser} className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Chat with สามก๊ก"
          onClick={() => {
            if (mode !== '3kok') setStatus('open');
            setMode('3kok');
            setOpen((v) => (mode === '3kok' ? !v : true));
          }}
          aria-expanded={open && mode === '3kok'}
          aria-haspopup="dialog"
          className={`flex h-14 w-14 items-center justify-center rounded-full border shadow-lg shadow-black/30 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            open && mode === '3kok'
              ? 'border-accent bg-accent text-black'
              : 'border-accent/40 bg-black text-accent'
          }`}
        >
          <FontAwesomeIcon icon={faScroll} className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.section
            key="panel"
            role="dialog"
            aria-label="Chat with Fiez"
            aria-live="polite"
            aria-modal="false"
            className="fixed bottom-36 right-4 md:bottom-40 md:right-6 z-[200] flex h-[500px] w-[min(92vw,360px)] flex-col rounded-2xl border border-accent/25 bg-black/95 p-3 text-white shadow-2xl shadow-black/60 backdrop-blur-md"
            initial={reducedMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
            transition={openTransition}
          >
            {/* Header */}
            <header className="flex items-center justify-between border-b border-accent/20 pb-2">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-wide">
                {mode === '3kok' ? (
                  <>
                    <FontAwesomeIcon icon={faScroll} className="h-4 w-4 text-accent" aria-hidden="true" />
                    <span>สามก๊ก</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-accent" aria-hidden="true" />
                    <span>Artemis</span>
                  </>
                )}
              </h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Minimize chat"
                  onClick={() => setOpen(false)}
                  className="rounded text-white/70 transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <FontAwesomeIcon icon={faWindowMinimize} className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Close chat"
                  onClick={() => {
                    setOpen(false);
                  }}
                  className="rounded text-white/70 transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
                <p className="m-auto text-center text-sm text-white/70">
                  {mode === '3kok' ? (
                    <>
                      ถามได้ทุกเรื่องเกี่ยวกับสามก๊ก — ตัวละคร เหตุการณ์ และกลศึก
                      <span className="mt-1 block text-xs text-white/50">
                        Answered from the สามก๊ก (Three Kingdoms) novel, with the
                        passages cited.
                      </span>
                    </>
                  ) : (
                    'Ask me anything about my work, stack, or availability.'
                  )}
                </p>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.role === 'user'
                      ? 'self-end max-w-[80%] rounded-lg bg-accent px-2 py-1 text-sm font-medium text-black'
                      : 'self-start max-w-[85%] rounded-lg bg-white/10 px-2 py-1 text-sm text-white'
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
                            className={safe ? 'text-xs text-accent underline' : 'text-xs text-white/60'}
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
                <p className="self-start rounded-lg bg-error/20 px-2 py-1 text-sm">
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
                <p className="self-start rounded-lg bg-error/20 px-2 py-1 text-sm">
                  Something went wrong. Please try again.
                </p>
              )}
            </div>

            {/* AC-T3-1..2: consent notice — sits above the composer, dismissable. */}
            {!consentDismissed && (
              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1 text-xs text-white/70">
                <FontAwesomeIcon
                  icon={faShieldHalved}
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span>Answered only after the owner approves. Q&amp;A are reviewed &amp; logged to improve the bot.</span>
                <button
                  type="button"
                  aria-label="Dismiss consent notice"
                  className="ml-auto"
                  onClick={() => {
                    setConsentDismissed(true);
                    try {
                      localStorage.setItem('concierge_consent_dismissed', '1');
                    } catch {
                      // localStorage may be blocked (private mode); consent
                      // just won't persist across reloads — acceptable.
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faClose} className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            )}

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
                className="max-h-28 min-h-[44px] w-full resize-none rounded-lg border border-white/10 bg-white/10 p-2 text-sm text-white placeholder-white/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <button
                type="button"
                aria-label="Send"
                disabled={status === 'awaiting' || status === 'composing'}
                onClick={() => void send()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-black transition-colors hover:bg-accent-h focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40"
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
