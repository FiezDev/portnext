'use client';

import { useTexture, Billboard, Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useState, useRef } from 'react';
import gsap from 'gsap';
import type { Mesh } from 'three';

export interface IconBillboardProps {
  position: [number, number, number];
  iconUrl: string;
  tooltip: string;
  href: string;
}

const IconBillboard = ({ position, iconUrl, tooltip, href }: IconBillboardProps) => {
  const tex = useTexture(iconUrl);
  const meshRef = useRef<Mesh>(null);
  const invalidate = useThree(s => s.invalidate);
  const [hovered, setHovered] = useState(false);

  const onEnter = () => {
    setHovered(true);
    if (meshRef.current) {
      gsap.to(meshRef.current.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.25, ease: 'power2.out', onUpdate: invalidate });
    }
  };
  const onLeave = () => {
    setHovered(false);
    if (meshRef.current) {
      gsap.to(meshRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.25, ease: 'power2.out', onUpdate: invalidate });
    }
  };
  const onClick = () => window.open(href, '_blank', 'noopener,noreferrer');

  return (
    <Billboard position={position}>
      <mesh ref={meshRef} onPointerEnter={onEnter} onPointerLeave={onLeave} onClick={onClick}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshBasicMaterial map={tex} transparent />
      </mesh>
      {hovered && (
        <Html center distanceFactor={4} zIndexRange={[100, 0]}>
          <div className="px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap pointer-events-none">
            {tooltip}
          </div>
        </Html>
      )}
    </Billboard>
  );
};

export default IconBillboard;
