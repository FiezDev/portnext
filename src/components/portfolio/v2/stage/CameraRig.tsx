'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import gsap from 'gsap';
import { CAMERA_PRESETS } from '../gsap/timelines';
import type { PageId } from '../shared/pages';

interface CameraRigProps {
  currentPage: PageId;
  previousPage?: PageId;
  reducedMotion?: boolean;
}

const CameraRig = ({ currentPage, previousPage, reducedMotion = false }: CameraRigProps) => {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const lookRef = useRef(new Vector3(0, 0, 0));

  useEffect(() => {
    if (!previousPage || previousPage === currentPage) {
      const init = CAMERA_PRESETS[currentPage];
      camera.position.set(...init.pos);
      lookRef.current.set(...init.look);
      camera.lookAt(lookRef.current);
      invalidate();
      return;
    }

    const target = CAMERA_PRESETS[currentPage];
    const dur = reducedMotion ? 0 : 0.9;
    const tl = gsap.timeline({ onUpdate: invalidate });
    tl.to(camera.position, { x: target.pos[0], y: target.pos[1], z: target.pos[2], duration: dur, ease: 'power3.inOut' }, 0);
    tl.to(lookRef.current, { x: target.look[0], y: target.look[1], z: target.look[2], duration: dur, ease: 'power3.inOut' }, 0);
    return () => { tl.kill(); };
  }, [currentPage, previousPage, reducedMotion, camera, invalidate]);

  useFrame(() => {
    camera.lookAt(lookRef.current);
  });

  return null;
};

export default CameraRig;
