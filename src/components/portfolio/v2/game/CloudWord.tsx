'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { letterFragments } from './letterGeometry';
import type { Rotation } from './heroGameLogic';

export interface CloudWordItem {
  text: string;
  x: number;
  y: number;
  rotation: Rotation;
  fontSize: number;
  isHighlighted: boolean;
  animDuration: number;
  animDelay: number;
}

interface CloudWordProps {
  item: CloudWordItem;
  isGame: boolean;
  isHit: boolean;
  isTarget: boolean;
  /** Live miss nonce for THIS word (0 for non-wrong words). Drives the shake. */
  wrongNonce: number;
  reduced: boolean;
  onHit: (word: string) => void;
}

const BASE_FILL = 'rgba(80,85,95,0.7)';
const GOLD = '#FBBF24';
const BRIGHT = '#FFE000'; // bright yellow the target shine grows to over ~5s
const RED = '#EF4444';

function CloudWordImpl({ item, isGame, isHit, isTarget, wrongNonce, reduced, onHit }: CloudWordProps) {
  const controls = useAnimationControls();
  const [shattering, setShattering] = useState(false);
  const prevHit = useRef(false);
  const shardsRef = useRef<SVGGElement>(null);
  // Live mirror so the shake settle can see whether this word just became the
  // target (avoids clobbering a freshly-assigned glow back to grey).
  const isTargetRef = useRef(isTarget);
  isTargetRef.current = isTarget;

  // Rising edge of isHit → shatter/fade, then self-prune (return null) so hit
  // words don't linger as invisible nodes (hitWords is a persisted set).
  useEffect(() => {
    if (isHit && !prevHit.current) {
      prevHit.current = true;
      setShattering(true);
      const t = setTimeout(() => setShattering(false), reduced ? 350 : 700);
      return () => clearTimeout(t);
    }
    if (!isHit) {
      prevHit.current = false;
      setShattering(false);
    }
  }, [isHit, reduced]);

  // Base / target-glow state (game live words only).
  useEffect(() => {
    if (!isGame || isHit) return;
    if (isTarget && !reduced) {
      // Shine grows from the base colour to bright yellow over ~5s, then holds.
      controls.start(
        {
          fill: BRIGHT,
          x: 0, // cancel any leftover shake offset when this word becomes the target
          filter: ['drop-shadow(0 0 0px rgba(255,224,0,0))', 'drop-shadow(0 0 18px #FFE000)'],
          opacity: 1,
        },
        { fill: { duration: 5, ease: 'linear' }, filter: { duration: 5, ease: 'easeIn' }, opacity: { duration: 0.4 } }
      );
    } else if (isTarget && reduced) {
      controls.set({ fill: BRIGHT, x: 0, opacity: 0.97 });
    } else {
      controls.start(
        { fill: BASE_FILL, opacity: 0.85, filter: 'drop-shadow(0 0 0px rgba(251,191,36,0))', x: 0 },
        { duration: 0.3 }
      );
    }
  }, [isGame, isTarget, reduced, isHit, controls]);

  // Wrong-click shake (one-shot, re-armed by the nonce). Returns to base after.
  useEffect(() => {
    if (!isGame || wrongNonce <= 0) return;
    let cancelled = false;
    (async () => {
      await controls.start(
        reduced
          ? { fill: [RED, BASE_FILL], opacity: [0.85, 0.45, 0.85] } // non-color channel for reduced-motion
          : { x: [0, -6, 6, -5, 5, -3, 3, 0], fill: [RED, RED, BASE_FILL] },
        { duration: 0.4, ease: 'easeInOut' }
      );
      // Don't reset to grey if this word became the target mid-shake (it's glowing now).
      if (!cancelled && !isTargetRef.current) {
        controls.start({ x: 0, fill: BASE_FILL, opacity: 0.85 }, { duration: 0.12 });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isGame, wrongNonce, reduced, controls]);

  // GSAP shatter — on a correct hit the letters pop, fling out, tumble + fall, fade.
  useGSAP(
    () => {
      if (!isGame || !isHit || !shattering || reduced) return;
      const shards = shardsRef.current?.querySelectorAll('text');
      if (!shards || shards.length === 0) return;
      const frags = letterFragments(item);
      const tl = gsap.timeline();
      shards.forEach((el, i) => {
        const f = frags[i];
        if (!f) return;
        const at = i * 0.018;
        tl.fromTo(
          el,
          { scale: 1, opacity: 1, x: 0, y: 0, rotation: 0 },
          { scale: 1.5, duration: 0.1, ease: 'back.out(3)' },
          at
        ).to(
          el,
          {
            x: f.tx * 2.4,
            y: f.ty * 2.4 + 70,
            rotation: f.spin * 2.6,
            scale: 0.12,
            opacity: 0,
            duration: 0.72,
            ease: 'power3.out',
          },
          at + 0.08
        );
      });
    },
    { scope: shardsRef, dependencies: [shattering, isHit] }
  );

  // ---- Decorative (non-game): byte-identical to the original inline word ----
  if (!isGame) {
    return (
      <motion.text
        x={item.x}
        y={item.y}
        fontFamily="monospace"
        fontWeight="bold"
        fontSize={item.fontSize}
        textAnchor="middle"
        dominantBaseline="middle"
        transform={`rotate(${item.rotation}, ${item.x}, ${item.y})`}
        fill={BASE_FILL}
        initial={{ opacity: 0.3 }}
        animate={{ opacity: item.isHighlighted ? 0 : reduced ? 0.55 : [0.3, 0.75, 0.3] }}
        transition={
          reduced
            ? { duration: 0.3 }
            : { opacity: { duration: item.animDuration, repeat: Infinity, ease: 'easeInOut', delay: item.animDelay } }
        }
      >
        {item.text}
      </motion.text>
    );
  }

  // ---- Game: a hit word shatters/fades, then unmounts ----
  if (isHit) {
    if (!shattering) return null;
    if (reduced) {
      return (
        <motion.text
          x={item.x}
          y={item.y}
          fontFamily="monospace"
          fontWeight="bold"
          fontSize={item.fontSize}
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(${item.rotation}, ${item.x}, ${item.y})`}
          fill={GOLD}
          style={{ pointerEvents: 'none' }}
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {item.text}
        </motion.text>
      );
    }
    return (
      <g ref={shardsRef}>
        {letterFragments(item).map((f) => (
          <text
            key={f.i}
            x={f.x}
            y={f.y}
            fontFamily="monospace"
            fontWeight="bold"
            fontSize={item.fontSize}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={BRIGHT}
            style={{ transformBox: 'fill-box', transformOrigin: 'center', pointerEvents: 'none' }}
          >
            {f.char}
          </text>
        ))}
      </g>
    );
  }

  // ---- Game: live word. Rotation on the <g> (SVG attr); the inner <text> owns
  //      all CSS transforms (shake x, hover scale) so they never fight. ----
  return (
    <g transform={`rotate(${item.rotation}, ${item.x}, ${item.y})`}>
      <motion.text
        x={item.x}
        y={item.y}
        fontFamily="monospace"
        fontWeight="bold"
        fontSize={item.fontSize}
        textAnchor="middle"
        dominantBaseline="middle"
        tabIndex={0}
        role="button"
        aria-label={item.text}
        onClick={() => onHit(item.text)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onHit(item.text);
          }
        }}
        style={{
          transformBox: 'fill-box',
          transformOrigin: 'center',
          pointerEvents: 'auto',
          cursor: 'pointer',
          outline: 'none',
          ...(isTarget && reduced ? { filter: 'drop-shadow(0 0 8px #FFE000)' } : null),
        }}
        initial={{ opacity: 0.85, fill: BASE_FILL }}
        animate={controls}
        whileHover={reduced ? undefined : { scale: 1.12 }}
        whileFocus={{ scale: 1.2, fill: GOLD }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {item.text}
      </motion.text>
    </g>
  );
}

const CloudWord = memo(
  CloudWordImpl,
  (a, b) =>
    a.item === b.item &&
    a.isGame === b.isGame &&
    a.isHit === b.isHit &&
    a.isTarget === b.isTarget &&
    a.wrongNonce === b.wrongNonce &&
    a.reduced === b.reduced &&
    a.onHit === b.onHit
);

export default CloudWord;
