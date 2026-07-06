import {
  BENTO_PATTERN,
  bentoSpanClass,
  bentoSpanForImage,
  nextFeatured,
  driftTarget,
} from './bentoLayout';

describe('bentoSpanForImage', () => {
  it('maps 4:3 desktop screenshots to the near-4:3 tall tile', () => {
    expect(bentoSpanForImage(400, 300)).toBe('col-span-1 row-span-2');
  });

  it('maps portrait phone screenshots to the tallest tile', () => {
    expect(bentoSpanForImage(150, 300)).toBe('col-span-1 row-span-3');
  });

  it('maps ultra-wide banners to a wide single-row tile', () => {
    expect(bentoSpanForImage(2000, 400)).toBe('col-span-2 row-span-1');
  });

  it('returns null without dimensions (caller falls back to pattern)', () => {
    expect(bentoSpanForImage(undefined, undefined)).toBeNull();
    expect(bentoSpanForImage(400, 0)).toBeNull();
  });
});

describe('bentoSpanClass', () => {
  it('cycles the pattern by index', () => {
    expect(bentoSpanClass(0)).toBe(BENTO_PATTERN[0]);
    expect(bentoSpanClass(BENTO_PATTERN.length)).toBe(BENTO_PATTERN[0]);
    expect(bentoSpanClass(BENTO_PATTERN.length + 2)).toBe(BENTO_PATTERN[2]);
  });

  it('always returns a col-span + row-span class pair', () => {
    for (let i = 0; i < BENTO_PATTERN.length; i++) {
      expect(bentoSpanClass(i)).toMatch(/col-span-\d/);
      expect(bentoSpanClass(i)).toMatch(/row-span-\d/);
    }
  });

  it('varies sizes across the pattern', () => {
    expect(new Set(BENTO_PATTERN).size).toBeGreaterThan(1);
  });
});

describe('nextFeatured', () => {
  it('advances and wraps', () => {
    expect(nextFeatured(0, 7)).toBe(1);
    expect(nextFeatured(6, 7)).toBe(0);
  });

  it('is safe on empty lists', () => {
    expect(nextFeatured(0, 0)).toBe(0);
  });
});

describe('driftTarget', () => {
  it('maps rand=0 / 0.5 / 1 to -range / 0 / +range', () => {
    expect(driftTarget(() => 0, 20)).toEqual({ x: -20, y: -20 });
    expect(driftTarget(() => 0.5, 20)).toEqual({ x: 0, y: 0 });
    expect(driftTarget(() => 1, 20)).toEqual({ x: 20, y: 20 });
  });

  it('stays within bounds for arbitrary rand values', () => {
    const seq = [0.13, 0.87, 0.42, 0.99];
    let i = 0;
    const { x, y } = driftTarget(() => seq[i++ % seq.length], 20);
    expect(Math.abs(x)).toBeLessThanOrEqual(20);
    expect(Math.abs(y)).toBeLessThanOrEqual(20);
  });
});
