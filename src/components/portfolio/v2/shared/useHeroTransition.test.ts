import {
  canUseVideoTransition,
  clipSrc,
  isClipPage,
  HERO_TIMINGS,
  CLIP_PAGES,
} from './useHeroTransition';

const allReady = Object.fromEntries(CLIP_PAGES.map((p) => [p, true]));

describe('canUseVideoTransition', () => {
  it('allows Main → clip page with a ready clip', () => {
    for (const to of CLIP_PAGES) {
      expect(
        canUseVideoTransition({ from: 'Main', to, reduced: false, ready: allReady })
      ).toBe(true);
    }
  });

  it('falls back when the clip is missing or still loading', () => {
    expect(
      canUseVideoTransition({ from: 'Main', to: 'About', reduced: false, ready: {} })
    ).toBe(false);
    expect(
      canUseVideoTransition({
        from: 'Main',
        to: 'About',
        reduced: false,
        ready: { About: false },
      })
    ).toBe(false);
  });

  it('falls back for reduced motion', () => {
    expect(
      canUseVideoTransition({ from: 'Main', to: 'About', reduced: true, ready: allReady })
    ).toBe(false);
  });

  it('falls back for non-Main origins and Main targets', () => {
    expect(
      canUseVideoTransition({ from: 'About', to: 'Skill', reduced: false, ready: allReady })
    ).toBe(false);
    expect(
      canUseVideoTransition({ from: 'About', to: 'Main', reduced: false, ready: allReady })
    ).toBe(false);
  });
});

describe('clip mapping', () => {
  it('maps pages to the agreed file names', () => {
    expect(clipSrc('About', 'desktop')).toBe('/videos/transitions/about-desktop.mp4');
    expect(clipSrc('Projects', 'mobile')).toBe('/videos/transitions/projects-mobile.mp4');
  });

  it('Main is never a clip page', () => {
    expect(isClipPage('Main')).toBe(false);
  });
});

describe('timings', () => {
  it('keeps the agreed pacing (1s clear, ≤2.5s clip, 300ms reveal)', () => {
    expect(HERO_TIMINGS.clearMs).toBe(1000);
    expect(HERO_TIMINGS.playCapMs).toBe(2500);
    expect(HERO_TIMINGS.revealMs).toBe(300);
  });
});
