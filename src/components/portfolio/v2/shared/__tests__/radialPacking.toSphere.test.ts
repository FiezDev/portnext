import { toSphere } from '../radialPacking';

describe('toSphere', () => {
  const items = [
    { x: 0, y: 0 },         // center
    { x: 100, y: 0 },       // right
    { x: 0, y: 100 },       // bottom
    { x: -100, y: -100 },   // top-left
  ];

  it('returns one 3D point per input item', () => {
    const out = toSphere(items, 6);
    expect(out).toHaveLength(items.length);
    out.forEach(([x, y, z]) => {
      expect(typeof x).toBe('number');
      expect(typeof y).toBe('number');
      expect(typeof z).toBe('number');
    });
  });

  it('places center item near +Z axis on the front hemisphere', () => {
    const [[x, y, z]] = toSphere(items, 6);
    expect(z).toBeGreaterThan(0); // front hemisphere
    expect(Math.abs(x)).toBeLessThan(0.5);
    expect(Math.abs(y)).toBeLessThan(0.5);
  });

  it('all points lie on the sphere of given radius', () => {
    const out = toSphere(items, 6);
    out.forEach(([x, y, z]) => {
      const r = Math.sqrt(x * x + y * y + z * z);
      expect(r).toBeCloseTo(6, 1);
    });
  });
});
