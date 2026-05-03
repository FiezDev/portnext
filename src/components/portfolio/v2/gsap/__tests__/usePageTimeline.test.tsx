import { renderHook } from '@testing-library/react';
import { usePageTimeline } from '../usePageTimeline';

jest.mock('gsap', () => {
  const tl = { kill: jest.fn(), to: jest.fn().mockReturnThis(), pause: jest.fn() };
  return {
    __esModule: true,
    default: {
      timeline: jest.fn().mockReturnValue(tl),
      core: {},
    },
  };
});

jest.mock('@react-three/fiber', () => ({
  useThree: (selector: (s: { camera: null }) => unknown) => selector({ camera: null }),
}));

describe('usePageTimeline', () => {
  it('does nothing on first render with same prev/current', () => {
    const { result } = renderHook(() =>
      usePageTimeline({ currentPage: 'Main', previousPage: 'Main', enabled: true })
    );
    expect(result.current).toBeNull();
  });

  it('returns null when disabled', () => {
    const { result } = renderHook(() =>
      usePageTimeline({ currentPage: 'About', previousPage: 'Main', enabled: false })
    );
    expect(result.current).toBeNull();
  });
});
