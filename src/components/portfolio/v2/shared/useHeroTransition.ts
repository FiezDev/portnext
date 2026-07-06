'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PageId } from './useComplexTransition';

// Cinematic Main→X video transition:
//   idle → clearing (word cloud fades, portrait stays)
//        → playing  (fullscreen clip, page swaps underneath)
//        → revealing (overlay fades on the clip's golden wash)
//        → idle
// Any missing precondition (no clip file, reduced motion, non-Main origin)
// falls back to the existing slide transition — the site never breaks.

export type HeroPhase = 'idle' | 'clearing' | 'playing' | 'revealing';

export const HERO_TIMINGS = {
  clearMs: 1000,
  playCapMs: 2500,
  revealMs: 300,
} as const;

export const CLIP_PAGES = ['About', 'Skill', 'Projects', 'Contact'] as const;
export type ClipPage = (typeof CLIP_PAGES)[number];
export type ClipFormat = 'desktop' | 'mobile';

export const clipSrc = (page: ClipPage, format: ClipFormat) =>
  `/videos/transitions/${page.toLowerCase()}-${format}.mp4`;

export const isClipPage = (page: PageId): page is ClipPage =>
  (CLIP_PAGES as readonly string[]).includes(page);

// Pure gate — unit-tested. Video runs only for Main → clip-page navs with a
// ready clip and no reduced-motion preference.
export const canUseVideoTransition = (opts: {
  from: PageId;
  to: PageId;
  reduced: boolean;
  ready: Partial<Record<ClipPage, boolean>>;
}): boolean =>
  !opts.reduced &&
  opts.from === 'Main' &&
  opts.to !== 'Main' &&
  isClipPage(opts.to) &&
  opts.ready[opts.to] === true;

interface UseHeroTransitionArgs {
  currentPage: PageId;
  reduced: boolean;
  commit: (page: PageId) => void;
}

export const useHeroTransition = ({
  currentPage,
  reduced,
  commit,
}: UseHeroTransitionArgs) => {
  const [phase, setPhase] = useState<HeroPhase>('idle');
  const [format, setFormat] = useState<ClipFormat>('desktop');
  const [activeClip, setActiveClip] = useState<string | null>(null);
  const readyRef = useRef<Partial<Record<ClipPage, boolean>>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<HeroPhase>('idle');
  phaseRef.current = phase;

  // Pick clip format by viewport; only affects the NEXT transition.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setFormat(mq.matches ? 'mobile' : 'desktop');
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Preload the current format's clips after load settles. A clip that 404s
  // simply never becomes ready → its nav keeps the slide transition.
  useEffect(() => {
    if (reduced) return;
    readyRef.current = {};
    const videos: HTMLVideoElement[] = [];
    const t = setTimeout(() => {
      CLIP_PAGES.forEach((page) => {
        const v = document.createElement('video');
        v.preload = 'auto';
        v.muted = true;
        v.src = clipSrc(page, format);
        v.addEventListener(
          'canplaythrough',
          () => {
            readyRef.current[page] = true;
          },
          { once: true }
        );
        v.addEventListener('error', () => {
          readyRef.current[page] = false;
        });
        videos.push(v);
      });
    }, 2500);
    return () => {
      clearTimeout(t);
      videos.forEach((v) => {
        v.removeAttribute('src');
        v.load();
      });
    };
  }, [format, reduced]);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const finish = useCallback(() => {
    setPhase('revealing');
    clearTimer();
    timerRef.current = setTimeout(() => {
      setActiveClip(null);
      setPhase('idle');
    }, HERO_TIMINGS.revealMs);
  }, []);

  /** Try the cinematic path. Returns false → caller uses the normal transition. */
  const requestTransition = useCallback(
    (to: PageId): boolean => {
      if (phaseRef.current !== 'idle') return true; // in flight — swallow extra navs
      if (
        !canUseVideoTransition({
          from: currentPage,
          to,
          reduced,
          ready: readyRef.current,
        })
      ) {
        return false;
      }
      const target = to as ClipPage;
      setActiveClip(clipSrc(target, format));
      setPhase('clearing');
      clearTimer();
      timerRef.current = setTimeout(() => {
        commit(target); // page swaps while the opaque clip covers it
        setPhase('playing');
        timerRef.current = setTimeout(finish, HERO_TIMINGS.playCapMs);
      }, HERO_TIMINGS.clearMs);
      return true;
    },
    [commit, currentPage, format, finish, reduced]
  );

  /** Click/Esc/video-end during playback → jump to the reveal. */
  const skip = useCallback(() => {
    if (phaseRef.current === 'playing') finish();
  }, [finish]);

  useEffect(() => clearTimer, []);

  return { phase, activeClip, requestTransition, skip };
};
