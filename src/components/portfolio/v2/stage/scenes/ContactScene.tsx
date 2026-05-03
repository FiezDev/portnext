'use client';

import { Points, PointMaterial } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, forwardRef } from 'react';
import { Group, Points as ThreePoints, Vector3 } from 'three';

const COUNT = 400;

const ContactScene = forwardRef<Group, { visible: boolean }>(({ visible }, ref) => {
  const pointsRef = useRef<ThreePoints>(null);
  const invalidate = useThree(s => s.invalidate);

  const positions = useMemo(() => {
    const a = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      a[i * 3]     = (Math.random() - 0.5) * 8;
      a[i * 3 + 1] = (Math.random() - 0.5) * 5;
      a[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return a;
  }, []);

  useFrame(({ pointer }) => {
    if (!visible || !pointsRef.current) return;
    const drift = new Vector3(pointer.x * 0.3, pointer.y * 0.3, 0);
    pointsRef.current.position.lerp(drift, 0.02);
    invalidate();
  });

  return (
    <group ref={ref} visible={visible}>
      <Points ref={pointsRef} positions={positions} stride={3}>
        <PointMaterial transparent color="#FBBF24" size={0.025} sizeAttenuation depthWrite={false} />
      </Points>
    </group>
  );
});
ContactScene.displayName = 'ContactScene';
export default ContactScene;
