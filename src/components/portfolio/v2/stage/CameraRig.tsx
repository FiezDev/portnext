'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { CAMERA_PRESETS } from '../gsap/timelines';
import type { PageId } from '../shared/pages';

interface CameraRigProps {
  currentPage: PageId;
  previousPage?: PageId;
}

const CameraRig = ({ currentPage }: CameraRigProps) => {
  const camera = useThree((s) => s.camera);
  const targetPos = useRef(new Vector3());
  const targetLook = useRef(new Vector3());

  useEffect(() => {
    const preset = CAMERA_PRESETS[currentPage];
    targetPos.current.set(...preset.pos);
    targetLook.current.set(...preset.look);
  }, [currentPage]);

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.1);
    camera.lookAt(targetLook.current);
  });

  return null;
};

export default CameraRig;
