// Pure, deterministic per-letter shatter geometry. No Math.random in render —
// burst vectors are index-seeded so they're stable across re-renders.
//
// The cloud word is drawn with an SVG `transform=rotate(R, cx, cy)` attribute.
// For shatter we DON'T nest another transform: instead we PRE-ROTATE each
// letter's center into absolute SVG coords here, so each fragment is an upright
// <text> at its true on-screen position and framer-motion's CSS transform
// (translate/rotate/scale) composes cleanly with no attribute-vs-CSS conflict.
//
// Monospace advance = fontSize * 0.7 (matches wordWidth() in heroGameLogic) —
// = 21 at the game's fontSize 30. Always derive from item.fontSize.

import type { Rotation } from './heroGameLogic';

const COS: Record<Rotation, number> = { 0: 1, 90: 0, 180: -1, 270: 0 };
const SIN: Record<Rotation, number> = { 0: 0, 90: 1, 180: 0, 270: -1 };

export interface Fragment {
  i: number;
  char: string;
  /** Absolute SVG anchor (rotation already baked in — upright glyph). */
  x: number;
  y: number;
  /** framer-motion CSS-transform burst target (translate). */
  tx: number;
  ty: number;
  /** framer-motion CSS-transform tumble (deg). */
  spin: number;
}

export interface FragmentInput {
  text: string;
  x: number;
  y: number;
  rotation: Rotation;
  fontSize: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function letterFragments(item: FragmentInput): Fragment[] {
  const chars = Array.from(item.text).slice(0, 8); // <=8 guaranteed by pickGameWords(maxLen 8)
  const n = chars.length;
  const adv = item.fontSize * 0.7;
  const cos = COS[item.rotation];
  const sin = SIN[item.rotation];

  // Post-rotation unit vectors: baseline (along the word) + perpendicular.
  const bx = cos;
  const by = sin;
  const px = -sin;
  const py = cos;

  return chars.map((char, i) => {
    const off = (i - (n - 1) / 2) * adv; // local along-baseline offset (dy = 0)
    const x = item.x + off * cos;
    const y = item.y + off * sin;

    const side = n === 1 ? 0 : (i - (n - 1) / 2) / ((n - 1) / 2); // -1..+1
    const spread = 60 + i * 6; // perpendicular pop
    const along = side * 40; // outer letters fly further along the baseline

    return {
      i,
      char,
      x: round2(x),
      y: round2(y),
      tx: round2(px * spread + bx * along),
      ty: round2(py * spread + by * along - 18), // slight upward bias
      spin: (side >= 0 ? 1 : -1) * (60 + i * 18),
    };
  });
}
