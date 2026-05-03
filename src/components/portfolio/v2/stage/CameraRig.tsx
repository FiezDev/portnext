'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import type { PageId } from '../shared/useComplexTransition';

const CAMERA_PRESETS: Record<PageId, { pos: [number, number, number]; look: [number, number, number] }> = {
  Main:     { pos: [0, 0, 6],       look: [0, 0, 0] },
  About:    { pos: [-2, 0.3, 5],    look: [0, 0, 0] },
  Skill:    { pos: [0, 0, 4.5],     look: [0, 0, 0] },
  Projects: { pos: [0, 0.5, 5.5],   look: [0, 0, 0] },
  Contact:  { pos: [0, 0, 6],       look: [0, 0, 0] },
};

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
