'use client';

import { Billboard, Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useState, useRef } from 'react';
import gsap from 'gsap';
import type { Group } from 'three';

export interface IconBillboardProps {
  position: [number, number, number];
  iconUrl: string;
  tooltip: string;
  href: string;
}

const IconBillboard = ({ position, iconUrl, tooltip, href }: IconBillboardProps) => {
  const groupRef = useRef<Group>(null);
  const invalidate = useThree(s => s.invalidate);
  const [hovered, setHovered] = useState(false);

  const onEnter = () => {
    setHovered(true);
    if (groupRef.current) {
      gsap.to(groupRef.current.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.25, ease: 'power2.out', onUpdate: invalidate });
    }
  };
  const onLeave = () => {
    setHovered(false);
    if (groupRef.current) {
      gsap.to(groupRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.25, ease: 'power2.out', onUpdate: invalidate });
    }
  };
  const onClick = () => window.open(href, '_blank', 'noopener,noreferrer');

  return (
    <Billboard position={position}>
      <group ref={groupRef}>
        <Html
          center
          distanceFactor={4}
          transform
          occlude={false}
          zIndexRange={[10, 0]}
        >
          <button
            type="button"
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            onClick={onClick}
            className="w-12 h-12 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/60 hover:border-yellow-400/80 hover:bg-yellow-50/80 shadow-sm transition-colors cursor-pointer"
            aria-label={tooltip}
          >
            { /* eslint-disable-next-line @next/next/no-img-element */ }
            <img src={iconUrl} alt={tooltip} className="w-7 h-7 object-contain pointer-events-none" loading="lazy" />
          </button>
        </Html>
        {hovered && (
          <Html center distanceFactor={4} zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
            <div className="px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap mt-12">
              {tooltip}
            </div>
          </Html>
        )}
      </group>
    </Billboard>
  );
};

export default IconBillboard;
