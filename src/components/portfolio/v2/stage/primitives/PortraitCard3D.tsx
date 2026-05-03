'use client';

import { useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useState } from 'react';
import gsap from 'gsap';
import type { Mesh, Material } from 'three';

interface PortraitCard3DProps {
  baseUrl: string;
  hoverUrl: string;
  position?: [number, number, number];
}

const PortraitCard3D = ({ baseUrl, hoverUrl, position = [0, 0, 0] }: PortraitCard3DProps) => {
  const baseTex = useTexture(baseUrl);
  const hoverTex = useTexture(hoverUrl);
  const meshRef = useRef<Mesh>(null);
  const baseMatRef = useRef<any>(null);
  const hoverMatRef = useRef<any>(null);
  const invalidate = useThree(s => s.invalidate);
  const [, setHovered] = useState(false);

  // Parallax tilt
  useFrame(({ pointer }) => {
    if (!meshRef.current) return;
    const targetX = pointer.y * 0.14;
    const targetY = pointer.x * 0.14;
    meshRef.current.rotation.x += (targetX - meshRef.current.rotation.x) * 0.05;
    meshRef.current.rotation.y += (targetY - meshRef.current.rotation.y) * 0.05;
    invalidate();
  });

  const onEnter = () => {
    setHovered(true);
    if (hoverMatRef.current) gsap.to(hoverMatRef.current, { opacity: 1, duration: 0.3, onUpdate: invalidate });
    if (baseMatRef.current)  gsap.to(baseMatRef.current,  { opacity: 0, duration: 0.3, onUpdate: invalidate });
  };
  const onLeave = () => {
    setHovered(false);
    if (hoverMatRef.current) gsap.to(hoverMatRef.current, { opacity: 0, duration: 0.3, onUpdate: invalidate });
    if (baseMatRef.current)  gsap.to(baseMatRef.current,  { opacity: 1, duration: 0.3, onUpdate: invalidate });
  };

  return (
    <group position={position}>
      <mesh ref={meshRef} onPointerEnter={onEnter} onPointerLeave={onLeave}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshBasicMaterial ref={baseMatRef} map={baseTex} transparent opacity={1} />
      </mesh>
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshBasicMaterial ref={hoverMatRef} map={hoverTex} transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default PortraitCard3D;
