'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PageId } from './useComplexTransition';

// Page transitions, two layers:
//   • MORPH — every nav crossfades pages while shared layoutId elements
//     (kicker, heading, rule, portrait, motto) FLIP between layouts.
//   • FILM — full-opacity hero film ONLY on Main↔X navs: leaving Main he
//     walks out of frame; returning he walks back in and the clip's final
//     frame matches the live portrait, so the cut to the real page is
//     invisible. X→X navs morph with no film. The film is cage-aligned
//     (see FilmUnderlay) so he stands in the right spot at any width ≥1366;
//     narrower viewports skip the film (their portrait layout differs).

export const MORPH_TIMINGS = {
  morphMs: 650,
  filmSafetyMs: 5000, // fallback teardown if 'ended' never fires
} as const;

// Shared FLIP transition for every layoutId element — one curve so all
// morphing elements travel together.
export const MORPH_LAYOUT_TRANSITION = {
  layout: { duration: 0.6, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] },
};

export type ClipRole = 'leave' | 'return';

/** Which film a navigation plays — or none (X→X). */
export const pairRole = (from: PageId, to: PageId): ClipRole | null => {
  if (from === 'Main' && to !== 'Main') return 'leave';
  if (from !== 'Main' && to === 'Main') return 'return';
  return null;
};

export const clipSrc = (role: ClipRole) =>
  `/videos/transitions/${role}-desktop.mp4`;

// Pure gate — unit-tested. Optimistic: only a KNOWN-missing clip (preload
// errored ⇒ ready === false) blocks the film; still-loading is allowed and
// fades in via onCanPlay.
export const canShowFilm = (opts: {
  role: ClipRole | null;
  wide: boolean;
  reduced: boolean;
  ready: Partial<Record<ClipRole, boolean>>;
}): boolean =>
  opts.role !== null &&
  opts.wide &&
  !opts.reduced &&
  opts.ready[opts.role] !== false;

export const useMorphTransition = (reduced: boolean) => {
  const [film, setFilm] = useState<{ src: string; role: ClipRole } | null>(null);
  const [wide, setWide] = useState(false);
  const readyRef = useRef<Partial<Record<ClipRole, boolean>>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Film only where the cage-aligned geometry matches the live portrait.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1366px)');
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Preload both films early. A 404 never becomes ready → that direction
  // morphs without film.
  useEffect(() => {
    if (reduced || !wide) return;
    readyRef.current = {};
    const videos: HTMLVideoElement[] = [];
    const t = setTimeout(() => {
      (['leave', 'return'] as const).forEach((role) => {
        const v = document.createElement('video');
        v.preload = 'auto';
        v.muted = true;
        v.src = clipSrc(role);
        v.addEventListener(
          'canplaythrough',
          () => {
            readyRef.current[role] = true;
          },
          { once: true }
        );
        v.addEventListener('error', () => {
          readyRef.current[role] = false;
        });
        videos.push(v);
      });
    }, 400);
    return () => {
      clearTimeout(t);
      videos.forEach((v) => {
        v.removeAttribute('src');
        v.load();
      });
    };
  }, [reduced, wide]);

  const clearFilm = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setFilm(null);
  }, []);

  /** Call on every navigation with the ORIGIN page. */
  const onNavigate = useCallback(
    (from: PageId, to: PageId) => {
      const role = pairRole(from, to);
      if (!canShowFilm({ role, wide, reduced, ready: readyRef.current })) {
        clearFilm();
        return;
      }
      const r = role as ClipRole;
      setFilm({ src: clipSrc(r), role: r });
      if (timerRef.current) clearTimeout(timerRef.current);
      // Films play UNDER the page and run to their natural end ('ended'
      // drives teardown); this timer is only the safety net.
      timerRef.current = setTimeout(clearFilm, MORPH_TIMINGS.filmSafetyMs);
    },
    [clearFilm, reduced, wide]
  );

  /** Film finished — tear down. The film freezes on its last frame and fades
   *  out over returnFadeMs while the live portrait fades in on the same
   *  clock: one dissolve, no double-exposure. */
  const onFilmEnded = useCallback(() => {
    clearFilm();
  }, [clearFilm]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return { film, onNavigate, onFilmEnded };
};
