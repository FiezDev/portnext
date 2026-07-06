'use client';

import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from 'framer-motion';
import { useEffect, useState } from 'react';

// Desktop-only gold cursor accent: instant dot + lagging spring ring that
// swells over interactive elements. The native cursor stays visible —
// hiding it breaks iframes (reCAPTCHA) and confuses form fields.
const GoldCursor = () => {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 400, damping: 30, mass: 0.7 });
  const ringY = useSpring(y, { stiffness: 400, damping: 30, mass: 0.7 });

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const t = e.target as Element | null;
      setActive(
        !!t?.closest?.('a, button, [role="tab"], input, textarea, select, label')
      );
    };
    const leave = () => setVisible(false);

    window.addEventListener('mousemove', move, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave);
    return () => {
      window.removeEventListener('mousemove', move);
      document.documentElement.removeEventListener('mouseleave', leave);
    };
  }, [reduced, x, y]);

  if (!enabled || reduced) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200]">
      {/* Trailing ring */}
      <motion.div
        className="absolute h-7 w-7 rounded-full border border-amber-400/70"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          scale: active ? 1.9 : 1,
          opacity: visible ? (active ? 0.95 : 0.55) : 0,
          backgroundColor: active
            ? 'rgba(251, 191, 36, 0.10)'
            : 'rgba(251, 191, 36, 0)',
        }}
        transition={{ duration: 0.2 }}
      />
      {/* Dot */}
      <motion.div
        className="absolute h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: visible ? 1 : 0, scale: active ? 0.5 : 1 }}
        transition={{ duration: 0.15 }}
      />
    </div>
  );
};

export default GoldCursor;
