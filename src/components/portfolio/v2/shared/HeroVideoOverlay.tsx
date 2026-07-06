'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { HeroPhase } from './useHeroTransition';

interface HeroVideoOverlayProps {
  phase: HeroPhase;
  src: string | null;
  onSkip: () => void;
}

// Fullscreen clip that covers the page swap. First frame matches the cleared
// canvas (seam trick), last frames are a golden wash the fade-out hides in.
const HeroVideoOverlay = ({ phase, src, onSkip }: HeroVideoOverlayProps) => {
  const visible = phase === 'playing' || phase === 'revealing';

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, onSkip]);

  if (!visible || !src) return null;

  return (
    <motion.div
      aria-hidden
      onClick={onSkip}
      className="fixed inset-0 z-[150] bg-[#FAFAF9] cursor-pointer"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'revealing' ? 0 : 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <video
        src={src}
        autoPlay
        muted
        playsInline
        onEnded={onSkip}
        className="h-full w-full object-cover"
      />
    </motion.div>
  );
};

export default HeroVideoOverlay;
