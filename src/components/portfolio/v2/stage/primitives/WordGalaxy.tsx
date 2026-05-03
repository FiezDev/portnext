'use client';

import { Text } from '@react-three/drei';
import { useMemo, useRef, useEffect } from 'react';
import type { Group } from 'three';
import gsap from 'gsap';
import { useThree } from '@react-three/fiber';
import { generateRadialPackedWords, toSphere } from '../../shared/radialPacking';

export interface WordGalaxyProps {
  visible: boolean;
  radius?: number;
  count?: number;
  highlightedIndices?: Set<number>;
  baseColor?: string;
  highlightColor?: string;
}

const WordGalaxy = ({
  visible,
  radius = 3,
  count = 50,
  highlightedIndices,
  baseColor = '#A1A1AA',
  highlightColor = '#FBBF24',
}: WordGalaxyProps) => {
  const groupRef = useRef<Group>(null);
  const invalidate = useThree((s) => s.invalidate);

  const words = useMemo(() => generateRadialPackedWords(count, 1), [count]);
  const positions = useMemo(
    () => toSphere(words.map(w => ({ x: w.x, y: w.y })), radius),
    [words, radius]
  );

  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    const tl = gsap.timeline({ onUpdate: invalidate });

    if (visible) {
      // Entering: words fly in from depth (+12 in z), settle to base position
      g.children.forEach((child, idx) => {
        const baseZ = positions[idx]?.[2] ?? 0;
        gsap.set(child.position, { z: baseZ + 12 });
        tl.to(child.position, {
          z: baseZ,
          duration: 0.6,
          ease: 'power2.out',
          delay: idx * 0.005,
        }, 0);
      });
    } else {
      // Leaving: words explode outward (+15 in z)
      g.children.forEach((child, idx) => {
        const baseZ = positions[idx]?.[2] ?? 0;
        tl.to(child.position, {
          z: baseZ + 15,
          duration: 0.7,
          ease: 'power2.in',
          delay: idx * 0.003,
        }, 0);
      });
    }

    return () => { tl.kill(); };
  }, [visible, positions, invalidate]);

  return (
    <group ref={groupRef} visible={visible}>
      {words.map((w, i) => {
        const [x, y, z] = positions[i];
        const isHi = highlightedIndices?.has(i) ?? false;
        return (
          <Text
            key={i}
            position={[x, y, z]}
            fontSize={0.18}
            color={isHi ? highlightColor : baseColor}
            anchorX="center"
            anchorY="middle"
            outlineWidth={isHi ? 0.005 : 0}
            outlineColor={isHi ? highlightColor : '#00000000'}
            material-transparent
            material-opacity={0.85}
          >
            {w.text}
          </Text>
        );
      })}
    </group>
  );
};

export default WordGalaxy;
