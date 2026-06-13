'use client';

import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

/**
 * Left-bracket "START!" call-to-action. Rendered through a portal with `fixed`
 * positioning so it sticks to the top-left of the VIEWPORT (not the centered
 * max-width content column) and isn't offset by a transformed ancestor.
 */
export default function StartBracket({ onStart }: { onStart: () => void }) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <motion.button
      type="button"
      onClick={onStart}
      aria-label="Start the word-hunt game"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="group fixed left-4 top-4 z-[90] pointer-events-auto md:left-5 md:top-5"
    >
      <span
        className="relative flex h-40 w-28 items-center justify-center rounded-l-3xl
          border-y-4 border-l-4 border-yellow-500/80 bg-gradient-to-r from-yellow-50/80 to-transparent
          shadow-[inset_0_0_30px_rgba(251,191,36,0.15)] transition-all duration-300
          group-hover:border-yellow-500 group-hover:from-yellow-100/90
          group-hover:shadow-[inset_0_0_44px_rgba(251,191,36,0.35)] md:h-48 md:w-32"
      >
        <span className="flex flex-col items-center">
          <span className="text-xl font-extrabold tracking-widest text-yellow-700 transition-colors group-hover:text-yellow-800 md:text-2xl">
            START!
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.25em] text-yellow-600/70">
            word hunt
          </span>
        </span>
        {/* Soft pulsing echo of the bracket. */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-l-3xl border-y-4 border-l-4 border-yellow-400"
          animate={{ opacity: [0, 0.45, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </span>
    </motion.button>,
    document.body
  );
}
