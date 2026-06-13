// Pure, React-free game logic for the hero Word-Hunt game.
// Deterministic where it matters (seeded RNG) so the board is reproducible and
// unit-testable. No DOM access except the localStorage helpers (guarded).

export type Rotation = 0 | 90 | 180 | 270;

export interface ScatteredWord {
  text: string;
  x: number;
  y: number;
  rotation: Rotation;
  fontSize: number;
}

const ROTATIONS: Rotation[] = [0, 90, 180, 270];

/** mulberry32 — tiny deterministic PRNG. Returns a function yielding [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Monospace glyph width for a word at a given font size. */
export function wordWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.7;
}

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface PickWordsOptions {
  /** Drop words longer than this so they fit a scatter cell (default 8). */
  maxLen?: number;
}

/** Pick `n` unique words from the pool, deterministic per `rng`. */
export function pickGameWords(
  allWords: readonly string[],
  n: number,
  rng: () => number,
  opts: PickWordsOptions = {}
): string[] {
  const maxLen = opts.maxLen ?? 8;
  const pool = Array.from(new Set(allWords)).filter(
    (w) => w.length > 0 && w.length <= maxLen
  );
  return shuffle(pool, rng).slice(0, Math.max(0, Math.min(n, pool.length)));
}

export interface ScatterOptions {
  centerX?: number;
  centerY?: number;
  fontSize?: number;
  regionWidth?: number;
  regionHeight?: number;
}

/**
 * Lay words out on a centered jittered grid with NO overlap. Each word is
 * confined to its own grid cell (jitter bounded so its bounding box stays in
 * the cell), which guarantees disjoint boxes as long as a word fits its cell.
 */
export function scatterWords(
  words: readonly string[],
  rng: () => number,
  opts: ScatterOptions = {}
): ScatteredWord[] {
  const n = words.length;
  if (n === 0) return [];

  const centerX = opts.centerX ?? 500;
  const centerY = opts.centerY ?? 500;
  const fontSize = opts.fontSize ?? 30;
  const regionWidth = opts.regionWidth ?? 880;
  const regionHeight = opts.regionHeight ?? 760;

  // Columns sized so the widest word fits a cell (works for any region aspect).
  const widest = Math.max(...words.map((w) => wordWidth(w, fontSize)));
  const gap = fontSize * 0.5;
  const cols = Math.max(1, Math.min(n, Math.floor(regionWidth / (widest + gap))));
  const rows = Math.ceil(n / cols);
  const cellW = regionWidth / cols;
  const cellH = regionHeight / rows;
  const originX = centerX - regionWidth / 2;
  const originY = centerY - regionHeight / 2;

  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) cells.push({ r, c });
  }
  const shuffledCells = shuffle(cells, rng);

  const margin = 4;
  return words.map((text, i) => {
    const cell = shuffledCells[i];
    const raw = wordWidth(text, fontSize);
    // Only rotate to vertical when the word's length fits the cell height —
    // otherwise keep it horizontal so it can never overflow its cell.
    const canVertical = raw + margin * 2 <= cellH;
    const rotation: Rotation = canVertical
      ? ROTATIONS[Math.floor(rng() * ROTATIONS.length)]
      : rng() < 0.5
        ? 0
        : 180;
    const horizontal = rotation === 0 || rotation === 180;
    const bw = horizontal ? raw : fontSize;
    const bh = horizontal ? fontSize : raw;

    const ccx = originX + cell.c * cellW + cellW / 2;
    const ccy = originY + cell.r * cellH + cellH / 2;
    const jx = Math.max(0, (cellW - bw) / 2 - margin);
    const jy = Math.max(0, (cellH - bh) / 2 - margin);

    return {
      text,
      x: ccx + (rng() * 2 - 1) * jx,
      y: ccy + (rng() * 2 - 1) * jy,
      rotation,
      fontSize,
    };
  });
}

/** Pick the next target, never repeating `prev` back-to-back (unless 1 word). */
export function pickNextTarget(
  words: readonly string[],
  prev: string | null,
  rng: () => number
): string {
  if (words.length === 0) return prev ?? '';
  if (words.length === 1) return words[0];

  let next = words[Math.floor(rng() * words.length)];
  let guard = 0;
  while (next === prev && guard < 50) {
    next = words[Math.floor(rng() * words.length)];
    guard++;
  }
  if (next === prev) next = words.find((w) => w !== prev) ?? words[0];
  return next;
}

/** Format a whole number of seconds as `m:ss` (clamps negatives to 0:00). */
export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/** Next streak value: +1 on a correct hit, reset to 0 on a miss. */
export function nextStreak(current: number, correct: boolean): number {
  return correct ? current + 1 : 0;
}

const DEFAULT_BEST_KEY = 'word-hunt:best';

function safeStorage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Best score from localStorage; 0 when absent/unavailable. SSR-safe. */
export function loadBest(key: string = DEFAULT_BEST_KEY): number {
  const store = safeStorage();
  if (!store) return 0;
  const raw = store.getItem(key);
  const n = raw == null ? 0 : parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Persist `score` as the best if it beats the stored value. Returns the best. */
export function saveBest(score: number, key: string = DEFAULT_BEST_KEY): number {
  const best = Math.max(loadBest(key), Math.max(0, Math.floor(score)));
  const store = safeStorage();
  if (store) {
    try {
      store.setItem(key, String(best));
    } catch {
      /* ignore quota / disabled storage */
    }
  }
  return best;
}
