'use client';

import { Text } from '@react-three/drei';
import { useMemo, forwardRef } from 'react';
import type { Group } from 'three';
import { generateRadialPackedWords, toSphere } from '../../shared/radialPacking';

export interface WordGalaxyProps {
  visible: boolean;
  radius?: number;
  count?: number;
  highlightedIndices?: Set<number>;
  baseColor?: string;
  highlightColor?: string;
}

const WordGalaxy = forwardRef<Group, WordGalaxyProps>(
  ({ visible, radius = 6, count = 50, highlightedIndices, baseColor = '#A1A1AA', highlightColor = '#FBBF24' }, ref) => {
    const words = useMemo(() => generateRadialPackedWords(count, 1), [count]);
    const positions = useMemo(() => toSphere(words.map(w => ({ x: w.x, y: w.y })), radius), [words, radius]);

    return (
      <group ref={ref} visible={visible}>
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
  }
);
WordGalaxy.displayName = 'WordGalaxy';
export default WordGalaxy;
