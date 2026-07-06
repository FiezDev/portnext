// Pure layout helpers for the bento Projects grid. Deterministic by index so
// SSR and client render identical markup (no hydration mismatch).

// Static literal classes so Tailwind's scanner picks them up.
export const BENTO_PATTERN = [
  'col-span-2 row-span-2',
  'col-span-1 row-span-1',
  'col-span-1 row-span-2',
  'col-span-2 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-2 row-span-1',
  'col-span-1 row-span-2',
] as const;

// Tile shapes with their rendered aspect on the desktop grid
// (col ≈ 331px, row 120px + 12px gap). Approximate is fine — we only need
// the closest match so screenshots render with minimal crop.
const TILE_SHAPES: { cls: string; aspect: number }[] = [
  { cls: 'col-span-1 row-span-1', aspect: 331 / 120 },
  { cls: 'col-span-2 row-span-1', aspect: 674 / 120 },
  { cls: 'col-span-1 row-span-2', aspect: 331 / 252 },
  { cls: 'col-span-2 row-span-2', aspect: 674 / 252 },
  { cls: 'col-span-1 row-span-3', aspect: 331 / 384 },
];

// Pick the tile whose aspect is closest (log-scale) to the screenshot's.
export const bentoSpanForImage = (
  width?: number,
  height?: number
): string | null => {
  if (!width || !height) return null;
  const target = width / height;
  let best = TILE_SHAPES[0];
  for (const shape of TILE_SHAPES) {
    if (
      Math.abs(Math.log(target / shape.aspect)) <
      Math.abs(Math.log(target / best.aspect))
    ) {
      best = shape;
    }
  }
  return best.cls;
};

export const bentoSpanClass = (index: number): string =>
  BENTO_PATTERN[((index % BENTO_PATTERN.length) + BENTO_PATTERN.length) % BENTO_PATTERN.length];

export const nextFeatured = (current: number, length: number): number =>
  length <= 0 ? 0 : (current + 1) % length;

// rand is injected so tests can pin it; callers pass Math.random.
export const driftTarget = (
  rand: () => number,
  range: number
): { x: number; y: number } => ({
  x: (rand() * 2 - 1) * range,
  y: (rand() * 2 - 1) * range,
});
