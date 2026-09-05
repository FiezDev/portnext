'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

/**
 * FloatingChat is heavy (react-markdown + remark-gfm + framer-motion +
 * FontAwesome ≈ 187KB of chunks) and useless until clicked. This wrapper
 * keeps its chunks OFF the first paint:
 *   - until the widget mounts, a static launcher shell paints — a
 *     pixel-identical clone of the closed bubble (FloatingChat.tsx launcher)
 *   - next/dynamic (ssr enabled — no CSR bailout) loads the real widget on
 *     idle (~2s) or first launcher hover/focus, warm before a visitor needs it
 *
 * Rendered OUTSIDE ReactQueryProviders in the layout: a lazy boundary inside
 * the provider subtree swallows the SSR'd page content into its hidden
 * bailout container (a11y-tree shift). As a preceding sibling it stays
 * self-contained.
 */
const FloatingChat = dynamic(() => import('@/components/global/FloatingChat'));

const FloatingChatLazy = () => {
  const [want, setWant] = useState(false);

  useEffect(() => {
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

  if (want) return <FloatingChat />;

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
