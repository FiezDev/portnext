'use client';

/**
 * VisualFreeze — deterministic-capture mode for the visual-diff gate.
 *
 * Active ONLY when the URL carries ?__seed=<n> (added by
 * scripts/visual-diff.sh). With the param:
 *   - Math.random becomes a seeded LCG → word-cloud / motto layouts render
 *     identically on every load
 *   - a style tag disables CSS animations/transitions (entrance states jump
 *     to final; infinite pulses stop)
 *   - images load eager + sync so nothing is mid-load at capture time
 *
 * Without the param this module is inert — production behaviour is
 * byte-identical. Module side-effect runs at chunk init, before any
 * component render that consumes randomness.
 */

const seededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
};

if (typeof window !== 'undefined') {
  const seedParam = new URLSearchParams(window.location.search).get('__seed');
  if (seedParam) {
    (window as typeof window & { __VISUAL_FREEZE__?: boolean }).__VISUAL_FREEZE__ = true;
    Math.random = seededRandom(Number(seedParam) || 1337);

    const style = document.createElement('style');
    style.textContent =
      '*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; scroll-behavior: auto !important; }';
    document.head.appendChild(style);

    Object.defineProperty(HTMLImageElement.prototype, 'loading', {
      set() {},
      get() {
        return 'eager';
      },
      configurable: true,
    });
    Object.defineProperty(HTMLImageElement.prototype, 'decoding', {
      set() {},
      get() {
        return 'sync';
      },
      configurable: true,
    });
  }
}

const VisualFreeze = () => null;
export default VisualFreeze;
