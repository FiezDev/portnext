import fs from 'fs';
import path from 'path';
import {
  canShowFilm,
  clipSrc,
  pairRole,
  MORPH_TIMINGS,
} from './useMorphTransition';
import { PAGE_ORDER } from './useComplexTransition';

// Derived from the canonical page list — a 6th page is covered automatically.
const NON_MAIN = PAGE_ORDER.filter((p) => p !== 'Main');

describe('pairRole — which navigations play film', () => {
  it('Main → X plays the walk-out', () => {
    NON_MAIN.forEach((to) => expect(pairRole('Main', to)).toBe('leave'));
  });

  it('X → Main plays the walk-in', () => {
    NON_MAIN.forEach((from) => expect(pairRole(from, 'Main')).toBe('return'));
  });

  it('X → X plays NO film (morph only)', () => {
    expect(pairRole('About', 'Skill')).toBeNull();
    expect(pairRole('Projects', 'Contact')).toBeNull();
    expect(pairRole('Skill', 'About')).toBeNull();
  });
});

describe('canShowFilm', () => {
  const base = { role: 'leave' as const, wide: true, reduced: false, ready: {} };

  it('optimistic while loading; blocked only when KNOWN missing', () => {
    expect(canShowFilm(base)).toBe(true);
    expect(canShowFilm({ ...base, ready: { leave: false } })).toBe(false);
  });

  it('no film below 1366px (portrait geometry differs there)', () => {
    expect(canShowFilm({ ...base, wide: false })).toBe(false);
  });

  it('respects reduced motion and the no-film role', () => {
    expect(canShowFilm({ ...base, reduced: true })).toBe(false);
    expect(canShowFilm({ ...base, role: null })).toBe(false);
  });

  it('readiness is per-role — the other role being missing changes nothing', () => {
    expect(canShowFilm({ ...base, ready: { return: false } })).toBe(true);
  });
});

describe('clips + timings', () => {
  it('two desktop films', () => {
    expect(clipSrc('leave')).toBe('/videos/transitions/leave-desktop.mp4');
    expect(clipSrc('return')).toBe('/videos/transitions/return-desktop.mp4');
  });

  it('both clip files exist in public/ — a rename/delete fails CI, not prod', () => {
    (['leave', 'return'] as const).forEach((role) => {
      const file = path.join(process.cwd(), 'public', clipSrc(role));
      expect(fs.existsSync(file)).toBe(true);
    });
  });

  it('films run to natural end; safety net outlives any clip', () => {
    expect(MORPH_TIMINGS.filmSafetyMs).toBeGreaterThan(4000); // clips ≤ ~3.5s
    expect(MORPH_TIMINGS.filmSafetyMs).toBeGreaterThan(MORPH_TIMINGS.morphMs);
  });
});
