'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { Camera } from 'three';
import type { PageId } from '../shared/useComplexTransition';
import { buildTransitionTimeline, SceneAnimator } from './timelines';

interface UsePageTimelineArgs {
  currentPage: PageId;
  previousPage?: PageId;
  enabled?: boolean;
  animators?: Partial<Record<PageId, SceneAnimator>>;
  reducedMotion?: boolean;
}

export function usePageTimeline(args: UsePageTimelineArgs): gsap.core.Timeline | null {
  const { currentPage, previousPage, enabled = true, animators, reducedMotion = false } = args;
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const lookRef = useRef(new Vector3(0, 0, 0));

  const camera = useThree((s) => s.camera) as Camera | null;

  useEffect(() => {
    if (!enabled || !previousPage || previousPage === currentPage || !camera) return;

    tlRef.current?.kill();
    tlRef.current = buildTransitionTimeline({
      camera,
      cameraLook: lookRef.current,
      fromAnimator: animators?.[previousPage],
      toAnimator: animators?.[currentPage],
      reducedMotion,
      fromPage: previousPage,
      toPage: currentPage,
    });
  }, [currentPage, previousPage, enabled, animators, reducedMotion, camera]);

  return tlRef.current;
}
