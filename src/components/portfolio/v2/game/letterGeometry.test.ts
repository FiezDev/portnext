import { letterFragments } from './letterGeometry';

const CODE = { text: 'CODE', x: 500, y: 500, rotation: 0 as const, fontSize: 30 };

describe('letterFragments — rotation-baked absolute anchors', () => {
  it('R=0: letters spread horizontally, y constant (adv = fs*0.7 = 21)', () => {
    const f = letterFragments({ ...CODE, rotation: 0 });
    expect(f.map((p) => p.x)).toEqual([468.5, 489.5, 510.5, 531.5]);
    expect(f.map((p) => p.y)).toEqual([500, 500, 500, 500]);
  });

  it('R=90: letters spread vertically (top→bottom), x constant', () => {
    const f = letterFragments({ ...CODE, rotation: 90 });
    expect(f.map((p) => p.x)).toEqual([500, 500, 500, 500]);
    expect(f.map((p) => p.y)).toEqual([468.5, 489.5, 510.5, 531.5]);
  });

  it('R=180: horizontal but mirrored, y constant', () => {
    const f = letterFragments({ ...CODE, rotation: 180 });
    expect(f.map((p) => p.x)).toEqual([531.5, 510.5, 489.5, 468.5]);
    expect(f.map((p) => p.y)).toEqual([500, 500, 500, 500]);
  });

  it('R=270: vertical but mirrored, x constant', () => {
    const f = letterFragments({ ...CODE, rotation: 270 });
    expect(f.map((p) => p.x)).toEqual([500, 500, 500, 500]);
    expect(f.map((p) => p.y)).toEqual([531.5, 510.5, 489.5, 468.5]);
  });

  it('preserves chars in order with their index', () => {
    const f = letterFragments({ ...CODE, rotation: 0 });
    expect(f.map((p) => p.char)).toEqual(['C', 'O', 'D', 'E']);
    expect(f.map((p) => p.i)).toEqual([0, 1, 2, 3]);
  });

  it('single-letter word sits at the center (no spread)', () => {
    const f = letterFragments({ text: 'A', x: 500, y: 500, rotation: 90, fontSize: 30 });
    expect(f).toHaveLength(1);
    expect(f[0].x).toBe(500);
    expect(f[0].y).toBe(500);
  });

  it('clamps to at most 8 fragments', () => {
    const f = letterFragments({ text: 'ABCDEFGHIJ', x: 500, y: 500, rotation: 0, fontSize: 30 });
    expect(f).toHaveLength(8);
  });

  it('is deterministic (no Math.random in the burst vectors)', () => {
    const a = letterFragments({ ...CODE, rotation: 0 });
    const b = letterFragments({ ...CODE, rotation: 0 });
    expect(a).toEqual(b);
    // burst vectors are finite numbers
    a.forEach((p) => {
      expect(Number.isFinite(p.tx)).toBe(true);
      expect(Number.isFinite(p.ty)).toBe(true);
      expect(Number.isFinite(p.spin)).toBe(true);
    });
  });
});
