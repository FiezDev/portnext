'use client';

import { Text, useTexture } from '@react-three/drei';
import { useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import type { Group } from 'three';

export interface ProjectCard3DProps {
  position: [number, number, number];
  rotationY: number;
  scale: number;
  imageUrl: string | null;       // null when no image is available (side projects)
  title: string;
  description: string;
  techStack: string[];
}

const FALLBACK_TEX = '/images/user-portrait.png';

const ProjectCard3D = ({
  position,
  rotationY,
  scale,
  imageUrl,
  title,
  description,
  techStack,
}: ProjectCard3DProps) => {
  const ref = useRef<Group>(null);
  const tex = useTexture(imageUrl || FALLBACK_TEX);
  const invalidate = useThree((s) => s.invalidate);
  const [flipped, setFlipped] = useState(false);

  const flip = () => {
    if (!ref.current) return;
    const next = !flipped;
    setFlipped(next);
    gsap.to(ref.current.rotation, {
      y: rotationY + (next ? Math.PI : 0),
      duration: 0.6,
      ease: 'power2.inOut',
      onUpdate: invalidate,
    });
  };

  return (
    <group ref={ref} position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* Front: project image */}
      <mesh onClick={flip}>
        <planeGeometry args={[2.4, 1.4]} />
        <meshBasicMaterial map={tex} />
      </mesh>

      {/* Back: title + desc + tech */}
      <group rotation={[0, Math.PI, 0]}>
        <mesh>
          <planeGeometry args={[2.4, 1.4]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <Text
          position={[0, 0.5, 0.01]}
          fontSize={0.16}
          color="#FBBF24"
          maxWidth={2.2}
          anchorX="center"
        >
          {title}
        </Text>
        <Text
          position={[0, 0.05, 0.01]}
          fontSize={0.1}
          color="#e5e5e5"
          maxWidth={2.2}
          anchorX="center"
        >
          {description}
        </Text>
        <Text
          position={[0, -0.5, 0.01]}
          fontSize={0.08}
          color="#9ca3af"
          maxWidth={2.2}
          anchorX="center"
        >
          {techStack.join(' • ')}
        </Text>
      </group>
    </group>
  );
};

export default ProjectCard3D;
