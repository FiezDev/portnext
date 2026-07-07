'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ClipRole } from './useMorphTransition';

// If the clip can't start within this window (autoplay denied, stall, 404
// past the optimistic gate), tear the film down immediately — the page's
// hidden portrait must never wait out the 5s safety timer.
const CANPLAY_DEADLINE_MS = 800;

// The hero film — FULL opacity, covering the page while he walks out/in.
// Cage-relative geometry: the start frame was captured at 1920px with the
// 1366px cage centered, so drawing the film at 1920/1366 = 140.5% of cage
// width, cage-centered and bottom-anchored, puts the filmed man exactly
// where the live portrait stands at any viewport ≥1366.
const FILM_SCALE = 1920 / 1366;

interface FilmProps {
  src: string;
  role: ClipRole;
  onEnded: () => void;
}

// No fades anywhere: the film's first/last frames match the live page, so
// it appears the instant it can play and hard-cuts away the instant it ends.
const Film = ({ src, role, onEnded }: FilmProps) => {
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
      className="absolute bottom-0 left-1/2 -translate-x-1/2 aspect-video z-[5] pointer-events-none"
      style={{ width: `${FILM_SCALE * 100}%` }}
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
        onCanPlay={() => setCanPlay(true)}
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
}

const FilmUnderlay = ({ film, onEnded }: FilmUnderlayProps) => (
  <AnimatePresence>
    {film && (
      <Film key={film.src} src={film.src} role={film.role} onEnded={onEnded} />
    )}
  </AnimatePresence>
);

export default FilmUnderlay;
