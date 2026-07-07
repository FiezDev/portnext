'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ClipRole } from './useMorphTransition';

// If the clip can't start within this window (autoplay denied, stall, 404
// past the optimistic gate), tear the film down immediately — the page's
// hidden portrait must never wait out the 5s safety timer.
const CANPLAY_DEADLINE_MS = 800;

// Film geometry — the GUARANTEE of a seamless portrait handoff.
//
// The clips start/end on a LITERAL 1920×1080 screenshot of this page (cage
// 1366px centered, gutters 277px). The live portrait sits in a 522px-wide
// column inside a 90%-of-viewport-height box, object-contain:
//   • width-constrained (vh ≥ ~868): him is a CONSTANT 781px tall
//     → film renders NATIVE 1:1 (width 1920px), him matches exactly.
//   • height-constrained (vh < 868): him is 0.9·vh tall
//     → film scales by s = 0.9·vh/781, keeping film-him ≡ page-him.
// Both regimes in one CSS expression: width = min(1920px, 221.25vh) where
// 221.25vh = 1920·0.9/781·100. The film's internal cage-right edge is
// pinned to the real cage-right via right = −(277/1920)·width. Bottom-
// anchored; overflow clipped by the root. Measured seamless (cut diff at
// the H.264 noise floor) across the 1366–1920 × 768–1200 matrix.
// PORTRAIT_H = 522 × 1024/684 (column width × image aspect) ≈ 781.5px.
const FILM_WIDTH_CSS = 'min(1920px, 221.25vh)';
const FILM_RIGHT_CSS = 'max(-277px, -31.92vh)';

interface FilmProps {
  src: string;
  role: ClipRole;
  onEnded: () => void;
  onPlaying: () => void;
}

// No fades anywhere: the film's first/last frames match the live page, so
// it appears the instant it can play and hard-cuts away the instant it ends.
const Film = ({ src, role, onEnded, onPlaying }: FilmProps) => {
  const [canPlay, setCanPlay] = useState(false);
  void role;

  useEffect(() => {
    if (canPlay) return;
    const t = setTimeout(onEnded, CANPLAY_DEADLINE_MS);
    return () => clearTimeout(t);
  }, [canPlay, onEnded]);

  return (
    <motion.div
      aria-hidden
      className="absolute bottom-0 aspect-video z-[5] pointer-events-none"
      style={{ width: FILM_WIDTH_CSS, right: FILM_RIGHT_CSS }}
      initial={{ opacity: 0 }}
      animate={{ opacity: canPlay ? 1 : 0 }}
      exit={{ opacity: 0, transition: { duration: 0 } }}
      transition={{ duration: 0 }}
    >
      <video
        src={src}
        autoPlay
        muted
        playsInline
        onCanPlay={(e) => {
          setCanPlay(true);
          // Explicit play + rejection handling: a denied autoplay (low-power
          // mode, policy) must tear the film down NOW, not wait out timers.
          e.currentTarget.play().catch(onEnded);
        }}
        onPlaying={onPlaying}
        onEnded={onEnded}
        onError={onEnded}
        className="h-full w-full"
      />
    </motion.div>
  );
};

interface FilmUnderlayProps {
  film: { src: string; role: ClipRole } | null;
  onEnded: () => void;
  onPlaying: () => void;
}

const FilmUnderlay = ({ film, onEnded, onPlaying }: FilmUnderlayProps) => (
  <AnimatePresence>
    {film && (
      <Film
        key={film.src}
        src={film.src}
        role={film.role}
        onEnded={onEnded}
        onPlaying={onPlaying}
      />
    )}
  </AnimatePresence>
);

export default FilmUnderlay;
