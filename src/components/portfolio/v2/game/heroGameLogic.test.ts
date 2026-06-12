import {
  mulberry32,
  wordWidth,
  pickGameWords,
  scatterWords,
  pickNextTarget,
  formatTime,
  nextStreak,
  loadBest,
  saveBest,
  type ScatteredWord,
} from './heroGameLogic';

// Rotation-aware axis-aligned bounding box, computed independently from the
// impl so the overlap test validates the geometric guarantee, not internals.
function aabb(w: ScatteredWord) {
  const raw = wordWidth(w.text, w.fontSize);
  const h = w.fontSize;
  const horizontal = w.rotation === 0 || w.rotation === 180;
  const bw = horizontal ? raw : h;
  const bh = horizontal ? h : raw;
  return {
    left: w.x - bw / 2,
    right: w.x + bw / 2,
    top: w.y - bh / 2,
    bottom: w.y + bh / 2,
  };
}
function overlaps(a: ScatteredWord, b: ScatteredWord) {
  const x = aabb(a);
  const y = aabb(b);
  return x.left < y.right && x.right > y.left && x.top < y.bottom && x.bottom > y.top;
}

describe('mulberry32', () => {
  it('is deterministic for the same seed', () => {
    const a = mulberry32(12345);
    const b = mulberry32(12345);
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('produces floats in [0, 1)', () => {
    const r = mulberry32(7);
    for (let i = 0; i < 200; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('differs across seeds', () => {
    expect(mulberry32(1)()).not.toEqual(mulberry32(2)());
  });
});

describe('wordWidth', () => {
  it('is monospace: length * fontSize * 0.7', () => {
    expect(wordWidth('CODE', 30)).toBeCloseTo(4 * 30 * 0.7);
    expect(wordWidth('', 30)).toBe(0);
  });
});

describe('pickGameWords', () => {
  const POOL = ['CODE', 'BUILD', 'CRAFT', 'DESIGN', 'LOGIC', 'PIXEL', 'FOCUS', 'REMARKABLE', 'EXPERIENCE'];

  it('returns n unique words', () => {
    const words = pickGameWords(POOL, 5, mulberry32(1));
    expect(words).toHaveLength(5);
    expect(new Set(words).size).toBe(5);
  });

  it('is deterministic for the same seed', () => {
    expect(pickGameWords(POOL, 5, mulberry32(99))).toEqual(pickGameWords(POOL, 5, mulberry32(99)));
  });

  it('only returns words from the pool', () => {
    const words = pickGameWords(POOL, 6, mulberry32(3));
    words.forEach((w) => expect(POOL).toContain(w));
  });

  it('filters out words longer than maxLen (default 8)', () => {
    const words = pickGameWords(POOL, POOL.length, mulberry32(3));
    expect(words).not.toContain('REMARKABLE'); // 10
    expect(words).not.toContain('EXPERIENCE'); // 10
    words.forEach((w) => expect(w.length).toBeLessThanOrEqual(8));
  });

  it('clamps to available unique words when n is too large', () => {
    const words = pickGameWords(['A', 'B', 'A'], 10, mulberry32(1));
    expect(words.length).toBeLessThanOrEqual(2);
    expect(new Set(words).size).toBe(words.length);
  });
});

describe('scatterWords', () => {
  const words = ['CODE', 'BUILD', 'CRAFT', 'DESIGN', 'LOGIC', 'PIXEL', 'FOCUS', 'DREAM', 'BOLD', 'SOLVE', 'FLOW', 'SPARK', 'IDEA', 'SCALE', 'ADAPT', 'LEARN', 'CLEAN', 'PURE', 'FAST', 'CORE'];

  it('returns one positioned word per input', () => {
    const placed = scatterWords(words, mulberry32(1));
    expect(placed).toHaveLength(words.length);
    placed.forEach((p) => {
      expect(words).toContain(p.text);
      expect([0, 90, 180, 270]).toContain(p.rotation);
      expect(p.fontSize).toBeGreaterThan(0);
    });
  });

  it('places every word fully inside the 0..1000 viewBox', () => {
    const placed = scatterWords(words, mulberry32(2));
    placed.forEach((p) => {
      const b = aabb(p);
      expect(b.left).toBeGreaterThanOrEqual(0);
      expect(b.top).toBeGreaterThanOrEqual(0);
      expect(b.right).toBeLessThanOrEqual(1000);
      expect(b.bottom).toBeLessThanOrEqual(1000);
    });
  });

  it('produces NO overlapping words', () => {
    const placed = scatterWords(words, mulberry32(4));
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        expect(overlaps(placed[i], placed[j])).toBe(false);
      }
    }
  });

  it('is roughly centered around (500, 500)', () => {
    const placed = scatterWords(words, mulberry32(5));
    const cx = placed.reduce((s, p) => s + p.x, 0) / placed.length;
    const cy = placed.reduce((s, p) => s + p.y, 0) / placed.length;
    expect(Math.abs(cx - 500)).toBeLessThan(120);
    expect(Math.abs(cy - 500)).toBeLessThan(120);
  });

  it('is deterministic for the same seed', () => {
    expect(scatterWords(words, mulberry32(8))).toEqual(scatterWords(words, mulberry32(8)));
  });
});

describe('pickNextTarget', () => {
  it('never returns the previous target back-to-back', () => {
    const words = ['A', 'B', 'C', 'D'];
    const rng = mulberry32(1);
    let prev = 'A';
    for (let i = 0; i < 100; i++) {
      const next = pickNextTarget(words, prev, rng);
      expect(next).not.toBe(prev);
      expect(words).toContain(next);
      prev = next;
    }
  });

  it('returns the only word when there is just one (cannot avoid repeat)', () => {
    expect(pickNextTarget(['ONLY'], 'ONLY', mulberry32(1))).toBe('ONLY');
  });

  it('handles a null previous target', () => {
    expect(['A', 'B']).toContain(pickNextTarget(['A', 'B'], null, mulberry32(1)));
  });
});

describe('formatTime', () => {
  it('formats seconds as m:ss', () => {
    expect(formatTime(15)).toBe('0:15');
    expect(formatTime(5)).toBe('0:05');
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(75)).toBe('1:15');
  });

  it('clamps negatives to 0:00', () => {
    expect(formatTime(-3)).toBe('0:00');
  });
});

describe('nextStreak', () => {
  it('increments on correct, resets on miss', () => {
    expect(nextStreak(3, true)).toBe(4);
    expect(nextStreak(3, false)).toBe(0);
    expect(nextStreak(0, true)).toBe(1);
  });
});

describe('best score (localStorage)', () => {
  const KEY = 'word-hunt:test-best';
  beforeEach(() => window.localStorage.removeItem(KEY));

  it('returns 0 when no best is stored', () => {
    expect(loadBest(KEY)).toBe(0);
  });

  it('saves and reloads the best score', () => {
    saveBest(7, KEY);
    expect(loadBest(KEY)).toBe(7);
  });

  it('only keeps the maximum (never lowers the best)', () => {
    saveBest(7, KEY);
    saveBest(3, KEY);
    expect(loadBest(KEY)).toBe(7);
  });

  it('returns the stored best from saveBest', () => {
    expect(saveBest(4, KEY)).toBe(4);
    expect(saveBest(2, KEY)).toBe(4);
  });
});
