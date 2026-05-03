'use client';

import { useEffect, RefObject } from 'react';
import gsap from 'gsap';

interface ScrollyEntranceOpts {
  y?: number;
  stagger?: number;
  duration?: number;
  delay?: number;
  selector?: string;
}

export function useScrollyEntrance(ref: RefObject<HTMLElement | null>, opts: ScrollyEntranceOpts = {}) {
  const { y = 30, stagger = 0.06, duration = 0.5, delay = 0, selector = '[data-stagger]' } = opts;

  useEffect(() => {
    if (!ref.current) return;
    const targets = ref.current.querySelectorAll(selector);
    if (targets.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        opacity: 0, y, duration, stagger, delay, ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    }, ref);

    return () => ctx.revert();
  }, [ref, y, stagger, duration, delay, selector]);
}
