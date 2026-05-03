import { renderHook } from '@testing-library/react';
import { useStageEnabled } from '../useStageEnabled';

const setMatchMedia = (matches: (query: string) => boolean) => {
  (window.matchMedia as jest.Mock) = jest.fn().mockImplementation((query: string) => ({
    matches: matches(query),
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
};

describe('useStageEnabled', () => {
  it('returns true on desktop with no reduced-motion', () => {
    setMatchMedia((q) => q === '(min-width: 768px)');
    const { result } = renderHook(() => useStageEnabled());
    expect(result.current).toBe(true);
  });

  it('returns false on small viewport', () => {
    setMatchMedia(() => false);
    const { result } = renderHook(() => useStageEnabled());
    expect(result.current).toBe(false);
  });

  it('returns false when prefers-reduced-motion: reduce', () => {
    setMatchMedia((q) => q === '(prefers-reduced-motion: reduce)' || q === '(min-width: 768px)');
    const { result } = renderHook(() => useStageEnabled());
    expect(result.current).toBe(false);
  });
});
