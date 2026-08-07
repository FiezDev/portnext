'use client';

// AC-T7-1..6 — FloatingChat widget
//
// A REAL state machine that talks same-origin to /api/chat (which proxies the
// portfolio bot). No bot secret ever touches the browser.

import {
  faArrowLeft,
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

// --- session persistence ---------------------------------------------------
// The transcript used to live only in React state and the proxy minted a NEW bot
// session per message, so a refresh lost the conversation and the bot answered
// every question as turn one. The browser now keeps {name, session ids,
// transcript}; the session id doubles as a resume code that rehydrates the
// conversation on any device.
const STORE_KEY = 'concierge_session_v1';
const CONSENT_KEY = 'concierge_consent_dismissed';
const MAX_STORED_MESSAGES = 40; // per bot — keeps localStorage small

type Mode = 'personal' | '3kok';
type ByMode<T> = Record<Mode, T>;

interface StoredSession {
  displayName: string;
  sessionId: ByMode<string | null>;
  messages: ByMode<ChatMessage[]>;
  // Returning visitor's last bot (gate toggle). Default 'personal' when absent
  // (legacy stored sessions predate the field).
  mode: Mode;
}

// localStorage can be absent (SSR), a method-less stub (Node 25), or throw
// (Safari private mode). One guarded accessor for every call site.
function safeStore(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    if (typeof localStorage?.getItem !== 'function') return null;
    return localStorage;
  } catch {
    return null;
  }
}

function loadStored(): StoredSession | null {
  const ls = safeStore();
  if (!ls) return null;
  try {
    const parsed = JSON.parse(ls.getItem(STORE_KEY) || 'null') as unknown;
    const o = parsed as Partial<StoredSession> | null;
    if (!o || typeof o.displayName !== 'string' || !o.displayName) return null;
    const mode = (m: Mode) => ({
      id: (o.sessionId?.[m] ?? null) as string | null,
      msgs: Array.isArray(o.messages?.[m]) ? (o.messages as ByMode<ChatMessage[]>)[m] : [],
    });
    const p = mode('personal');
    const k = mode('3kok');
    return {
      displayName: o.displayName.slice(0, 40),
      sessionId: { personal: p.id, '3kok': k.id },
      messages: { personal: p.msgs, '3kok': k.msgs },
      mode: o.mode === '3kok' ? '3kok' : 'personal',
    };
  } catch {
    return null;
  }
}

function saveStored(v: StoredSession): void {
  const ls = safeStore();
  if (!ls) return;
  const trim = (m: ChatMessage[]) => m.slice(-MAX_STORED_MESSAGES);
  try {
    ls.setItem(
      STORE_KEY,
      JSON.stringify({
        displayName: v.displayName,
        sessionId: v.sessionId,
        messages: { personal: trim(v.messages.personal), '3kok': trim(v.messages['3kok']) },
        mode: v.mode,
      }),
    );
  } catch {
    // Quota or private mode — the conversation just won't survive a reload.
  }
}

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
  sessionId?: string;
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
  // Gate-chosen bot, persisted so a returning visitor (who skips the gate)
  // keeps their last bot. 'personal' = Artemis, '3kok' = สามก๊ก.
  const [mode, setMode] = useState<'personal' | '3kok'>(
    () => loadStored()?.mode ?? 'personal',
  );
  // Per-mode message history: each bot keeps its OWN list. Switching FAB
  // swaps the visible list — no leak, no loss (the bug where chatting with
  // Artemis then opening สามก๊ก showed Artemis's history).
  const [messagesByMode, setMessagesByMode] = useState<
    Record<'personal' | '3kok', ChatMessage[]>
  >(() => loadStored()?.messages ?? { personal: [], '3kok': [] });
  // Identity gate: a display name (so an approved answer reaches the right
  // person) and per-bot session ids (so the bot has multi-turn context).
  const [displayName, setDisplayName] = useState<string>(
    () => loadStored()?.displayName ?? '',
  );
  const [sessionIdByMode, setSessionIdByMode] = useState<
    Record<'personal' | '3kok', string | null>
  >(() => loadStored()?.sessionId ?? { personal: null, '3kok': null });
  const [nameDraft, setNameDraft] = useState('');
  const [resumeDraft, setResumeDraft] = useState('');
  const [gateError, setGateError] = useState<string | null>(null);
  // Re-open the gate from inside the chat so a visitor can switch bot or
  // re-enter after startChat has set displayName. The gate renders when
  // !displayName (first visit) OR menuOpen (returning from the chat).
  const [menuOpen, setMenuOpen] = useState(false);
  // Derived: the active mode's history. All reads (render, auto-scroll dep)
  // go through this, so swapping `mode` swaps the visible list automatically.
  const messages = messagesByMode[mode];
  // AC-T3-1..2: dismissable consent notice. Persists per-browser via
  // localStorage so a visitor who closed it doesn't see it again on reload.
  const [consentDismissed, setConsentDismissed] = useState(
    () =>
      // Node 25 defines a localStorage GLOBAL STUB whose methods are missing, so
      // `typeof localStorage !== 'undefined'` passes during SSR and then throws
      // on .getItem — a 500 on every render under that runtime. Check for the
      // browser and for the method itself.
      typeof window !== 'undefined' &&
      typeof localStorage?.getItem === 'function' &&
      localStorage.getItem(CONSENT_KEY) === '1',
  );

  // Polling refs (kept off React state to avoid re-render churn).
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollStartRef = useRef<number>(0);
  const failCountRef = useRef<number>(0);
  const pollPendingIdRef = useRef<string | null>(null);
  const clientIdRef = useRef<string | null>(null);
  const abortedRef = useRef<boolean>(false);
  // The mode that SENT the in-flight request — read by pollOnce when it appends
  // the assistant answer, so the answer lands in the sending bot's transcript
  // even if the visible mode has since switched (chip setMode+send race).
  const pollModeRef = useRef<Mode>('personal');

  const messageListRef = useRef<HTMLDivElement>(null);

  // Persist identity + transcript whenever either changes. Only after the gate
  // is passed, so we never write a half-filled record.
  useEffect(() => {
    if (!displayName) return;
    saveStored({ displayName, sessionId: sessionIdByMode, messages: messagesByMode, mode });
  }, [displayName, sessionIdByMode, messagesByMode, mode]);

  // Pull a transcript back from the server for a session id. This is what makes
  // a resume code work on a machine that has never seen this conversation.
  const rehydrate = useCallback(
    async (sid: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/chat?sessionId=${encodeURIComponent(sid)}`);
        if (!res.ok) return false;
        const body = (await res.json()) as {
          messages?: { role: 'user' | 'assistant'; content: string; sources?: ChatMessage['sources'] }[];
        };
        const rows = Array.isArray(body?.messages) ? body.messages : [];
        setMessagesByMode((prev) => ({
          ...prev,
          [mode]: rows.map((m) => ({
            id: uuid(),
            role: m.role,
            content: m.content,
            sources: m.sources,
          })),
        }));
        return true;
      } catch {
        return false;
      }
    },
    [mode],
  );

  const startChat = useCallback(async () => {
    const name = nameDraft.trim();
    if (name.length < 2) return;
    const code = resumeDraft.trim();
    setGateError(null);
    if (code) {
      const ok = await rehydrate(code);
      if (!ok) {
        setGateError('That resume code did not match a conversation.');
        return;
      }
      setSessionIdByMode((prev) => ({ ...prev, [mode]: code }));
    }
    setDisplayName(name);
    // Returning from the menu: submitting the gate closes it and goes back to
    // the chat in the (possibly newly chosen) bot.
    setMenuOpen(false);
  }, [nameDraft, resumeDraft, mode, rehydrate]);

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
        // pollModeRef is set in send() at SEND time to the active mode; reading
        // it here (NOT the `mode` closure var) routes the answer correctly even
        // when a chip did setMode + send in one tap — otherwise the queued poll
        // captured the pre-switch mode and the answer landed in the wrong bot.
        const answeredMode = pollModeRef.current;
        setMessagesByMode((prev) => ({
          ...prev,
          [answeredMode]: [
            ...prev[answeredMode],
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
  const send = useCallback(async (message?: string, overrideMode?: Mode) => {
    const activeMode = overrideMode ?? mode;
    // Route the eventual polled ANSWER by the send-time mode, not the closure
    // mode at poll time — a chip's setMode + send in one handler would
    // otherwise leave the queued poll holding the pre-switch mode.
    pollModeRef.current = activeMode;
    const trimmed = (message ?? draft).trim();
    if (!trimmed || status === 'awaiting' || status === 'composing') return;

    const clientRequestId = uuid();
    clientIdRef.current = clientRequestId;

    const userMsg: ChatMessage = {
      id: clientRequestId,
      role: 'user',
      content: trimmed,
    };
    setMessagesByMode((prev) => ({ ...prev, [activeMode]: [...prev[activeMode], userMsg] }));
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
          mode: activeMode,
          client_request_id: clientRequestId,
          // Reusing the session is what gives the bot conversation context.
          sessionId: sessionIdByMode[activeMode],
          displayName,
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
    // First message mints the session; keep it so later turns reuse it and the
    // visitor has a resume code.
    const newSession = body.sessionId;
    if (typeof newSession === 'string' && newSession) {
      setSessionIdByMode((prev) =>
        prev[activeMode] === newSession ? prev : { ...prev, [activeMode]: newSession },
      );
    }
    startAwaiting(body.pendingId);
  }, [draft, status, startAwaiting, mode, sessionIdByMode, displayName]);

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
      {/* AC-T3-1: one bottom-right bubble launcher replaces the two mode FABs.
          Closed state shows a 2-line "AI"/"CHAT" label; open state shows the
          close (X) icon so it toggles closed. Mode is chosen at the gate. */}
      <button
        type="button"
        aria-label="AI Chat"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-5 z-[201] flex h-14 w-14 flex-col items-center justify-center rounded-full border border-accent/40 bg-black text-accent leading-none shadow-2xl shadow-black/60 transition-colors hover:bg-accent/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {open ? (
          <FontAwesomeIcon icon={faClose} className="h-5 w-5" />
        ) : (
          <>
            <span className="text-[10px] font-bold uppercase tracking-wide">AI</span>
            <span className="text-[10px] font-bold uppercase tracking-wide">CHAT</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.section
            key="panel"
            role="dialog"
            aria-label="AI Chat"
            aria-live="polite"
            aria-modal="false"
            className="fixed bottom-6 right-24 z-[200] flex h-[500px] w-[min(92vw,360px)] flex-col rounded-2xl border border-accent/25 bg-black/95 p-3 text-white shadow-2xl shadow-black/60 backdrop-blur-md"
            initial={reducedMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
            transition={openTransition}
          >
            {/* Header */}
            <header className="flex items-center justify-between border-b border-accent/20 pb-2">
              <div className="flex items-center gap-2">
                {/* Back-to-menu: returns to the gate (name pre-filled, bot toggle
                    pre-selected) so a visitor can switch Personal/3-Kingdom or
                    re-enter after they're already chatting. Only shown INSIDE the
                    chat — the gate is already the menu. */}
                {displayName && !menuOpen && (
                  <button
                    type="button"
                    aria-label="Back to menu"
                    onClick={() => {
                      setMenuOpen(true);
                      setNameDraft(displayName ?? '');
                      setResumeDraft('');
                      setGateError(null);
                    }}
                    className="rounded text-white/70 transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="h-3.5 w-3.5" />
                  </button>
                )}
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
              </div>
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

            {/* AC-T3-1..2: consent notice. Rendered ABOVE the gate so it is on screen
                when the visitor presses Start chat, which is the moment they
                agree. Dismissable, and the dismissal persists per browser. */}
            {!consentDismissed && (
              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1 text-xs text-white/70">
                <FontAwesomeIcon
                  icon={faShieldHalved}
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  By using this chat you agree that everything sent here is stored,
                  reviewed by the owner, and may be collected and used for model
                  research.
                </span>
                <button
                  type="button"
                  aria-label="Dismiss consent notice"
                  className="ml-auto"
                  onClick={() => {
                    setConsentDismissed(true);
                    try {
                      localStorage.setItem(CONSENT_KEY, '1');
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

            {/* Identity gate. A name means an approved answer reaches a person
                rather than an anonymous socket, and it anchors the session so
                follow-up questions have context. The resume code is that
                session id — paste it on another machine to continue there.
                Shows on first visit (!displayName) OR when the visitor re-opens
                it from the chat via the ← Menu control (menuOpen). */}
            {!displayName || menuOpen ? (
              <form
                className="flex grow flex-col justify-center gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void startChat();
                }}
              >
                <p className="text-sm text-white/70">
                  Tell me who I am talking to. I review and approve every answer
                  personally, so a name helps.
                </p>
                {/* A2: choose your bot at the gate. Persists (see saveStored) so a
                    returning visitor — who skips this gate — keeps their last bot. */}
                <div role="group" aria-label="Bot">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/60">
                    Bot
                  </span>
                  <div className="flex gap-1.5 rounded-lg border border-white/10 bg-white/5 p-1">
                    {(['personal', '3kok'] as const).map((m) => {
                      const active = mode === m;
                      const label = m === 'personal' ? 'Personal' : '3 Kingdoms';
                      return (
                        <button
                          key={m}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setMode(m)}
                          className={
                            'flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
                            (active
                              ? 'bg-accent text-black'
                              : 'text-white/60 hover:text-white')
                          }
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label htmlFor="concierge-name" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/60">
                    Your name
                  </label>
                  <input
                    id="concierge-name"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    maxLength={40}
                    autoComplete="name"
                    placeholder="e.g. Alex"
                    className="w-full rounded-lg border border-white/10 bg-white/10 p-2 text-sm text-white placeholder-white/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div>
                  <label htmlFor="concierge-resume" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/60">
                    Resume code (optional)
                  </label>
                  <input
                    id="concierge-resume"
                    value={resumeDraft}
                    onChange={(e) => setResumeDraft(e.target.value)}
                    placeholder="Paste to continue an earlier chat"
                    className="w-full rounded-lg border border-white/10 bg-white/10 p-2 text-sm text-white placeholder-white/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                {gateError && (
                  <p className="text-xs text-red-300" role="alert">
                    {gateError}
                  </p>
                )}
                {/* A4: review/training notice, shown at the gate so the visitor
                    sees it before pressing Start. */}
                <p className="text-[11px] leading-snug text-white/50">
                  Each message is reviewed by the site owner before it reaches
                  the AI, and conversations may be used to improve it.
                </p>
                <button
                  type="submit"
                  disabled={nameDraft.trim().length < 2}
                  className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-accent-h focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40"
                >
                  Start chat
                </button>
              </form>
            ) : (
              <>
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

            {/* The session id IS the resume code: device-independent, so it is
                shown rather than hidden. Anyone holding it can read this
                transcript, which is why it is only ever displayed to the person
                whose browser created it. */}
            {sessionIdByMode[mode] && (
              <div className="mt-1 flex items-center gap-2 text-[11px] text-white/50">
                <span className="shrink-0">Resume code</span>
                <code className="min-w-0 flex-1 truncate text-white/70">
                  {sessionIdByMode[mode]}
                </code>
                <button
                  type="button"
                  className="shrink-0 rounded text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  onClick={() => {
                    void navigator.clipboard
                      ?.writeText(sessionIdByMode[mode] as string)
                      .catch(() => {});
                  }}
                >
                  Copy
                </button>
              </div>
            )}

            {/* A4: one-line persistent review/training footer. */}
            <p className="mt-1 text-[11px] leading-snug text-white/50">
              Each message is reviewed by the site owner before it reaches the
              AI, and conversations may be used to improve it.
            </p>
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChat;
