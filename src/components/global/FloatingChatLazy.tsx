'use client';

import { useEffect, useState, type ComponentType } from 'react';

/**
 * FloatingChat is heavy (react-markdown + remark-gfm + framer-motion +
 * FontAwesome ≈ 187KB of chunks) and useless until clicked. This wrapper
 * keeps its execution off the first paint:
 *   - a static launcher shell paints at SSR — a pixel-identical clone of
 *     the closed bubble (FloatingChat.tsx launcher)
 *   - the real widget imports on idle (~2s) or first launcher hover/focus,
 *     warm before a visitor needs it
 *
 * Plain import() inside an effect — NOT next/dynamic/React.lazy: a
 * suspending lazy boundary at layout level bakes a
 * BAILOUT_TO_CLIENT_SIDE_RENDERING template into the prerendered HTML and
 * swallows page content into React's hidden boundary container (a11y tree
 * shifts). An effect-side import never suspends prerender.
 * Rendered AFTER children, outside any provider subtree.
 */
const FloatingChatLazy = () => {
  const [Chat, setChat] = useState<ComponentType | null>(null);
  const [want, setWant] = useState(false);

  useEffect(() => {
    if (!want) return;
    let live = true;
    import('@/components/global/FloatingChat').then((mod) => {
      if (live) setChat(() => mod.default);
    });
    return () => {
      live = false;
    };
  }, [want]);

  useEffect(() => {
    // deterministic captures: mount at once so the tree is stable at any
    // capture time (the 2s idle straddles capture windows otherwise)
    if ((window as typeof window & { __VISUAL_FREEZE__?: boolean }).__VISUAL_FREEZE__) {
      setWant(true);
      return;
    }
    const w = window as typeof window & {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number }
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (!w.requestIdleCallback) {
      const t = setTimeout(() => setWant(true), 2000);
      return () => clearTimeout(t);
    }
    const id = w.requestIdleCallback(() => setWant(true), {
      timeout: 3000,
    });
    return () => w.cancelIdleCallback?.(id);
  }, []);

  if (Chat) return <Chat />;

  // Static launcher shell — mirrors FloatingChat's closed bubble exactly.
  return (
    <button
      type="button"
      aria-label="AI Chat"
      aria-expanded={false}
      aria-haspopup="dialog"
      onPointerEnter={() => setWant(true)}
      onFocus={() => setWant(true)}
      className="fixed bottom-6 right-5 z-[201] flex h-14 w-14 flex-col items-center justify-center rounded-full border border-accent/40 bg-black text-accent leading-none shadow-2xl shadow-black/60 transition-colors hover:bg-accent/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <span className="text-[10px] font-bold uppercase tracking-wide">AI</span>
      <span className="text-[10px] font-bold uppercase tracking-wide">CHAT</span>
    </button>
  );
};

export default FloatingChatLazy;
