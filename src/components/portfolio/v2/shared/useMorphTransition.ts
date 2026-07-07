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

/** Pure policy — which page elements the film replaces right now.
 *  leave: keep the live portrait until the film is actually PAINTING
 *  (its first frame is bitmap-identical to the page, so the swap is
 *  invisible); a film that never plays never hides anything.
 *  return: portrait hidden for the whole film, cloud waits too. */
export const filmMasks = (
  film: { role: ClipRole } | null,
  playing: boolean
): { hidePortrait: boolean; hideCloud: boolean } => ({
  hidePortrait: film !== null && (film.role === 'return' || playing),
  hideCloud: film?.role === 'return',
});

export const useMorphTransition = (reduced: boolean) => {
  const [film, setFilm] = useState<{ src: string; role: ClipRole } | null>(null);
  const [playing, setPlaying] = useState(false);
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
    setPlaying(false);
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
      setPlaying(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      // Films play UNDER the page and run to their natural end ('ended'
      // drives teardown); this timer is only the safety net.
      timerRef.current = setTimeout(clearFilm, MORPH_TIMINGS.filmSafetyMs);
    },
    [clearFilm, reduced, wide]
  );

  /** Film finished (or failed) — hard-cut teardown. The clip's last frame is
   *  a literal screenshot of the page, so the cut is bitmap-identical. */
  const onFilmEnded = useCallback(() => {
    clearFilm();
  }, [clearFilm]);

  /** The video is actually rendering frames now — safe to swap the portrait
   *  underneath it (frame 1 is a literal screenshot of the page). */
  const onFilmPlaying = useCallback(() => {
    setPlaying(true);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const masks = filmMasks(film, playing);

  return { film, ...masks, onNavigate, onFilmEnded, onFilmPlaying };
};
