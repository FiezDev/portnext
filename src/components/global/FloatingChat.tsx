'use client';

// AC-T7-1..6 — FloatingChat widget
//
// A REAL state machine that talks same-origin to /api/chat (which proxies the
// portfolio bot). No bot secret ever touches the browser.
//
// Multi-session (v2): storage is a LIST of single-bot conversations, not one
// object. localStorage holds `concierge_sessions_v2` (Session[]) and
// `concierge_active_session_v2` (the active id). A returning visitor picks
// which conversation to resume from a dropdown in the gate/menu; the "start
// new chat" form creates a fresh session. v1 storage is migrated on load.

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

// --- session persistence (v2 — a LIST of conversations) -------------------
// v1 held ONE {displayName, per-mode session ids, per-mode messages, mode}.
// v2 holds a Session[]: each entry is one single-bot conversation. The active
// id reopens the last conversation on reload. v1 is migrated on first load.
const STORE_KEY_V1 = 'concierge_session_v1';
const STORE_KEY_V2 = 'concierge_sessions_v2';
const ACTIVE_KEY_V2 = 'concierge_active_session_v2';
const CONSENT_KEY = 'concierge_consent_dismissed';
const MAX_STORED_MESSAGES = 40; // per session — keeps localStorage small

type Mode = 'personal' | '3kok';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; url: string }[];
}

interface Session {
  id: string; // uuid — stable identity for this conversation
  displayName: string;
  mode: Mode; // which bot this conversation is with
  sessionId: string | null; // bot resume code, set on first successful POST
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// The v1 shape, used only for one-time migration.
interface StoredSessionV1 {
  displayName: string;
  sessionId: Record<Mode, string | null>;
  messages: Record<Mode, ChatMessage[]>;
  mode: Mode;
}

interface StoredState {
  sessions: Session[];
  activeId: string | null;
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

function isChatMessage(m: unknown): m is ChatMessage {
  if (!m || typeof m !== 'object') return false;
  const mm = m as Record<string, unknown>;
  return (
    typeof mm.id === 'string' &&
    (mm.role === 'user' || mm.role === 'assistant') &&
    typeof mm.content === 'string'
  );
}

// Validate + coerce one parsed object into a Session, or drop it. Defensive:
// localStorage is attacker-controllable (other tabs, extensions, devtools).
function parseSession(raw: unknown): Session | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === 'string' ? o.id : null;
  const displayName = typeof o.displayName === 'string' ? o.displayName : null;
  const mode: Mode | null = o.mode === '3kok' ? '3kok' : o.mode === 'personal' ? 'personal' : null;
  if (!id || !displayName || !mode) return null;
  const sessionId = typeof o.sessionId === 'string' ? o.sessionId : null;
  const messages = Array.isArray(o.messages)
    ? (o.messages as unknown[]).filter(isChatMessage)
    : [];
  const now = Date.now();
  const createdAt = typeof o.createdAt === 'number' ? o.createdAt : now;
  const updatedAt = typeof o.updatedAt === 'number' ? o.updatedAt : now;
  return {
    id,
    displayName: displayName.slice(0, 40),
    mode,
    sessionId,
    messages,
    createdAt,
    updatedAt,
  };
}

// Read + migrate. v2 wins if present; otherwise a present v1 is migrated
// (one Session per mode that has messages), and v1 is removed after a
// successful v2 write. Conversations are NEVER lost.
function loadStored(): StoredState {
  const ls = safeStore();
  if (!ls) return { sessions: [], activeId: null };

  // v2 present?
  try {
    const raw2 = ls.getItem(STORE_KEY_V2);
    if (raw2 !== null) {
      const parsed = JSON.parse(raw2) as unknown;
      if (Array.isArray(parsed)) {
        const sessions = (parsed as unknown[])
          .map(parseSession)
          .filter((s): s is Session => s !== null);
        let activeId: string | null = null;
        try {
          activeId = ls.getItem(ACTIVE_KEY_V2);
        } catch {
          activeId = null;
        }
        if (!activeId || !sessions.some((s) => s.id === activeId)) {
          activeId = sessions[0]?.id ?? null;
        }
        return { sessions, activeId };
      }
    }
  } catch {
    // fall through to v1 migration
  }

  // v1 present? migrate.
  try {
    const raw1 = ls.getItem(STORE_KEY_V1);
    if (raw1 !== null) {
      const o = JSON.parse(raw1) as Partial<StoredSessionV1> | null;
      if (o && typeof o.displayName === 'string' && o.displayName) {
        const name = o.displayName.slice(0, 40);
        const now = Date.now();
        const pMsgs = Array.isArray(o.messages?.personal) ? o.messages!.personal : [];
        const kMsgs = Array.isArray(o.messages?.['3kok']) ? o.messages!['3kok'] : [];
        const pId = o.sessionId?.personal;
        const kId = o.sessionId?.['3kok'];
        const sessions: Session[] = [];
        if (pMsgs.length > 0) {
          sessions.push({
            id: uuid(),
            displayName: name,
            mode: 'personal',
            sessionId: typeof pId === 'string' && pId ? pId : null,
            messages: pMsgs.slice(-MAX_STORED_MESSAGES),
            createdAt: now,
            updatedAt: now,
          });
        }
        if (kMsgs.length > 0) {
          sessions.push({
            id: uuid(),
            displayName: name,
            mode: '3kok',
            sessionId: typeof kId === 'string' && kId ? kId : null,
            messages: kMsgs.slice(-MAX_STORED_MESSAGES),
            createdAt: now,
            updatedAt: now,
          });
        }
        // Prefer the visitor's last bot as the active conversation.
        const preferredMode: Mode = o.mode === '3kok' ? '3kok' : 'personal';
        const activeId =
          sessions.find((s) => s.mode === preferredMode)?.id ?? sessions[0]?.id ?? null;
        // Write v2 first; only drop v1 once v2 is safely persisted.
        try {
          ls.setItem(STORE_KEY_V2, JSON.stringify(sessions));
          if (activeId) ls.setItem(ACTIVE_KEY_V2, activeId);
          else ls.removeItem(ACTIVE_KEY_V2);
          ls.removeItem(STORE_KEY_V1);
        } catch {
          // Quota / private mode — keep v1 so a later load can retry migration.
        }
        return { sessions, activeId };
      }
    }
  } catch {
    // corrupt v1 — ignore, fall through to empty
  }

  return { sessions: [], activeId: null };
}

function saveStored(sessions: Session[], activeId: string | null): void {
  const ls = safeStore();
  if (!ls) return;
  try {
    const trimmed = sessions.map((s) => ({
      ...s,
      messages: s.messages.slice(-MAX_STORED_MESSAGES),
    }));
    ls.setItem(STORE_KEY_V2, JSON.stringify(trimmed));
    if (activeId) ls.setItem(ACTIVE_KEY_V2, activeId);
    else ls.removeItem(ACTIVE_KEY_V2);
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

// Short, deterministic YYYY-MM-DD label for the dropdown. Deterministic on
// purpose so tests can assert against it without locale flakiness.
function shortDate(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function sessionLabel(s: Session): string {
  const bot = s.mode === '3kok' ? '3-Kingdom' : 'Personal';
  return `${s.displayName} · ${bot} · ${shortDate(s.updatedAt)}`;
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

  // v2: a LIST of conversations + the active id. The visible messages, bot
  // mode, displayName and resume code all DERIVE from the active session.
  const [sessions, setSessions] = useState<Session[]>(() => loadStored().sessions);
  const [activeId, setActiveId] = useState<string | null>(() => loadStored().activeId);
  // The gate's bot toggle selects the bot for a NEW session. Set to the active
  // session's mode when the menu is reopened from inside a chat.
  const [gateMode, setGateMode] = useState<Mode>('personal');

  const [nameDraft, setNameDraft] = useState('');
  const [resumeDraft, setResumeDraft] = useState('');
  const [gateError, setGateError] = useState<string | null>(null);
  // The menu (dropdown + new-chat form) shows on first visit (no active
  // session) OR when a visitor re-opens it from inside the chat via ← Menu.
  const [menuOpen, setMenuOpen] = useState(false);
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

  // The active conversation. All visible state reads (render, auto-scroll,
  // send, poll) go through this.
  const active = sessions.find((s) => s.id === activeId) ?? null;
  const messages = active?.messages ?? [];
  const gateVisible = !active || menuOpen;

  // Polling refs (kept off React state to avoid re-render churn).
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollStartRef = useRef<number>(0);
  const failCountRef = useRef<number>(0);
  const pollPendingIdRef = useRef<string | null>(null);
  const clientIdRef = useRef<string | null>(null);
  const abortedRef = useRef<boolean>(false);
  // The SESSION that SENT the in-flight request — read by pollOnce when it
  // appends the assistant answer, so the answer lands in the sending
  // conversation even if the visitor has since switched to another session in
  // the dropdown (the multi-session successor to the per-mode pollModeRef).
  const pollSessionIdRef = useRef<string | null>(null);

  const messageListRef = useRef<HTMLDivElement>(null);

  // Persist the whole conversation list (+ active id) whenever it changes.
  useEffect(() => {
    saveStored(sessions, activeId);
  }, [sessions, activeId]);

  // Pull a transcript back from the server for a session id. Pure: returns the
  // messages (or null on failure) so the caller can place them into whichever
  // session it chooses. This is what makes a resume code work on a machine
  // that has never seen this conversation.
  const fetchTranscript = useCallback(
    async (sid: string): Promise<ChatMessage[] | null> => {
      try {
        const res = await fetch(`/api/chat?sessionId=${encodeURIComponent(sid)}`);
        if (!res.ok) return null;
        const body = (await res.json()) as {
          messages?: { role: 'user' | 'assistant'; content: string; sources?: ChatMessage['sources'] }[];
        };
        const rows = Array.isArray(body?.messages) ? body.messages : [];
        return rows.map((m) => ({
          id: uuid(),
          role: m.role,
          content: m.content,
          sources: m.sources,
        }));
      } catch {
        return null;
      }
    },
    [],
  );

  const startChat = useCallback(async () => {
    const name = nameDraft.trim();
    if (name.length < 2) return;
    const code = resumeDraft.trim();
    setGateError(null);

    let msgs: ChatMessage[] = [];
    let sessionId: string | null = null;
    if (code) {
      const got = await fetchTranscript(code);
      if (!got) {
        setGateError('That resume code did not match a conversation.');
        return;
      }
      msgs = got;
      sessionId = code;
    }

    // Starting a new chat ALWAYS creates a new session (fresh or seeded from a
    // resume code). Resuming a SAVED conversation is done via the dropdown.
    const now = Date.now();
    const s: Session = {
      id: uuid(),
      displayName: name,
      mode: gateMode,
      sessionId,
      messages: msgs,
      createdAt: now,
      updatedAt: now,
    };
    setSessions((prev) => [...prev, s]);
    setActiveId(s.id);
    setMenuOpen(false);
    setNameDraft('');
    setResumeDraft('');
  }, [nameDraft, resumeDraft, gateMode, fetchTranscript]);

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

  // Update one session by id (functional update). Bumps updatedAt.
  const patchSession = useCallback(
    (id: string, patch: (s: Session) => Session): void => {
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...patch(s), updatedAt: Date.now() } : s)),
      );
    },
    [],
  );

  // AC-T7-5: poll the pending endpoint with constant cadence while pending.
  // Flips to Unavailable after K consecutive network/5xx failures; flips to
  // Expired after POLL_DURATION_MAX_MS total wall-clock.
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
        // Append the assistant answer to the SESSION that SENT the request.
        // pollSessionIdRef is set in send() at SEND time; reading it here (NOT
        // activeId) routes the answer correctly even if the visitor has since
        // picked another conversation in the dropdown.
        const answeredId = pollSessionIdRef.current;
        if (answeredId) {
          patchSession(answeredId, (sess) => ({
            ...sess,
            messages: [
              ...sess.messages,
              {
                id: uuid(),
                role: 'assistant',
                content: body.answer as string,
                sources: Array.isArray(body.sources) ? body.sources : undefined,
              },
            ],
          }));
        }
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
    [stopPolling, pollDurationMaxMs, pollMaxMs, pollMinMs, patchSession],
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
    [pollOnce, pollMinMs],
  );

  // AC-T7-6: send -> POST /api/chat. A retried POST with the same
  // client_request_id is forwarded verbatim (the bot dedupes).
  const send = useCallback(async (message?: string) => {
    const activeSession = sessions.find((s) => s.id === activeId) ?? null;
    if (!activeSession) return;
    const activeMode = activeSession.mode;
    // Route the eventual polled ANSWER to the session that SENT it — reading
    // activeId at poll time would misroute if the visitor switches sessions
    // while a request is in flight.
    pollSessionIdRef.current = activeSession.id;
    const trimmed = (message ?? draft).trim();
    if (!trimmed || status === 'awaiting' || status === 'composing') return;

    const clientRequestId = uuid();
    clientIdRef.current = clientRequestId;

    const userMsg: ChatMessage = {
      id: clientRequestId,
      role: 'user',
      content: trimmed,
    };
    patchSession(activeSession.id, (s) => ({
      ...s,
      messages: [...s.messages, userMsg],
    }));
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
          sessionId: activeSession.sessionId,
          displayName: activeSession.displayName,
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
    if (typeof newSession === 'string' && newSession && newSession !== activeSession.sessionId) {
      patchSession(activeSession.id, (s) => ({ ...s, sessionId: newSession }));
    }
    startAwaiting(body.pendingId);
  }, [draft, status, sessions, activeId, patchSession, startAwaiting]);

  // --- Render ------------------------------------------------------------
  const openTransition = useMemo(
    () =>
      reducedMotion
        ? ({ duration: 0 } as const)
        : ({ type: 'spring', stiffness: 300, damping: 26 } as const),
    [reducedMotion],
  );

  const activeMode = active?.mode ?? 'personal';
  const activeSessionId = active?.sessionId ?? null;
  const activeDisplayName = active?.displayName ?? '';

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
                {/* Back-to-menu: returns to the menu (dropdown of saved
                    sessions + new-chat form) so a visitor can switch
                    conversations or start a new one in another bot. Only shown
                    INSIDE the chat — the menu is already the menu. */}
                {active && !menuOpen && (
                  <button
                    type="button"
                    aria-label="Back to menu"
                    onClick={() => {
                      setMenuOpen(true);
                      setGateMode(active?.mode ?? 'personal');
                      setNameDraft(active?.displayName ?? '');
                      setResumeDraft('');
                      setGateError(null);
                    }}
                    className="rounded text-white/70 transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="h-3.5 w-3.5" />
                  </button>
                )}
                <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-wide">
                  {activeMode === '3kok' ? (
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

            {/* AC-T3-1..2: consent notice. Rendered ABOVE the gate/menu so it is
                on screen when the visitor presses Start chat, which is the
                moment they agree. Dismissable, and the dismissal persists per
                browser. */}
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

            {/* Menu / identity gate. A name means an approved answer reaches a
                person rather than an anonymous socket, and it anchors the
                session so follow-up questions have context. The resume code is
                that session id — paste it on another machine to continue there.
                Shows on first visit (no active session) OR when the visitor
                re-opens it from the chat via the ← Menu control (menuOpen). */}
            {gateVisible ? (
              <form
                className="flex grow flex-col justify-center gap-3 overflow-y-auto"
                onSubmit={(e) => {
                  e.preventDefault();
                  void startChat();
                }}
              >
                {/* Dropdown of saved conversations. Selecting one resumes it
                    (sets it active, swaps the visible transcript) and re-enters
                    the chat. Absent on a first visit. */}
                {sessions.length > 0 && (
                  <div>
                    <label
                      htmlFor="concierge-resume-select"
                      className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/60"
                    >
                      Resume a conversation
                    </label>
                    <select
                      id="concierge-resume-select"
                      value={activeId ?? ''}
                      onChange={(e) => {
                        const sid = e.target.value;
                        if (!sid) return;
                        const picked = sessions.find((s) => s.id === sid);
                        if (!picked) return;
                        setActiveId(picked.id);
                        setGateMode(picked.mode);
                        setMenuOpen(false);
                        setNameDraft('');
                        setResumeDraft('');
                        setGateError(null);
                      }}
                      className="w-full rounded-lg border border-white/10 bg-white/10 p-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
                    >
                      <option value="">— Pick a saved conversation —</option>
                      {sessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {sessionLabel(s)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <p className="text-sm text-white/70">
                  Tell me who I am talking to. I review and approve every answer
                  personally, so a name helps.
                </p>
                {/* A2: choose your bot at the gate. This selects the bot for the
                    NEW session being created. */}
                <div role="group" aria-label="Bot">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/60">
                    Bot
                  </span>
                  <div className="flex gap-1.5 rounded-lg border border-white/10 bg-white/5 p-1">
                    {(['personal', '3kok'] as const).map((m) => {
                      const isPressed = gateMode === m;
                      const label = m === 'personal' ? 'Personal' : '3 Kingdoms';
                      return (
                        <button
                          key={m}
                          type="button"
                          aria-pressed={isPressed}
                          onClick={() => setGateMode(m)}
                          className={
                            'flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
                            (isPressed
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
                    placeholder="Paste to import an earlier chat"
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
                  {activeMode === '3kok' ? (
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
            {activeSessionId && (
              <div className="mt-1 flex items-center gap-2 text-[11px] text-white/50">
                <span className="shrink-0">Resume code</span>
                <code className="min-w-0 flex-1 truncate text-white/70">
                  {activeSessionId}
                </code>
                <button
                  type="button"
                  className="shrink-0 rounded text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  onClick={() => {
                    void navigator.clipboard
                      ?.writeText(activeSessionId)
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
