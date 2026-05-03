'use client';

import { forwardRef, useEffect, useRef } from 'react';
import type { Group } from 'three';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import type { WorkProjectObj, SideProjectObj } from '@/types/object';
import ProjectCard3D from '../primitives/ProjectCard3D';
import { WorkProjects, SideProjects } from '@/mocks/projectMock';
import { useProjectsState } from '../projectsState';

const IMGIX_BASE = process.env.NEXT_PUBLIC_IMGIX_URL || '';

interface SlotPos {
  position: [number, number, number];
  rotationY: number;
  scale: number;
  offset: -1 | 0 | 1;
}

const SLOTS: SlotPos[] = [
  { position: [-2.2, 0, -0.6], rotationY:  0.96, scale: 0.7, offset: -1 },
  { position: [   0, 0,  0.0], rotationY:  0,    scale: 1.0, offset:  0 },
  { position: [ 2.2, 0, -0.6], rotationY: -0.96, scale: 0.7, offset:  1 },
];

interface NormalizedProject {
  imageUrl: string | null;
  title: string;
  description: string;
  techStack: string[];
}

function normalizeProject(p: WorkProjectObj | SideProjectObj): NormalizedProject {
  const isWork = 'projectPic' in p;

  const relativePath = isWork
    ? (p as WorkProjectObj).projectPic?.picurl?.pic?.[0] ?? null
    : null;

  const imageUrl = relativePath ? `${IMGIX_BASE}${relativePath}` : null;

  const description = (p.projectDesc ?? [])
    .map((d) => d.replace(/^- /, ''))
    .join(' ');

  return {
    imageUrl,
    title: p.projectName ?? p.projectIntro ?? 'Untitled',
    description,
    techStack: p.stack ?? [],
  };
}

const ProjectsScene = forwardRef<Group, { visible: boolean }>(({ visible }, ref) => {
  const kind  = useProjectsState((s) => s.kind);
  const index = useProjectsState((s) => s.index);
  const innerRef = useRef<Group>(null);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    if (!innerRef.current) return;
    const g = innerRef.current;
    const tl = gsap.timeline({ onUpdate: invalidate });
    tl.fromTo(g.position, { y: 0 }, { y: 0.4, duration: 0.18, ease: 'power2.in' }, 0);
    tl.fromTo(g.scale, { x: 1, y: 1, z: 1 }, { x: 0.8, y: 0.8, z: 0.8, duration: 0.18, ease: 'power2.in' }, 0);
    tl.to(g.position, { y: 0, duration: 0.3, ease: 'power2.out' }, 0.18);
    tl.to(g.scale, { x: 1, y: 1, z: 1, duration: 0.3, ease: 'back.out(2)' }, 0.18);
    return () => { tl.kill(); };
  }, [kind, invalidate]);

  const all: (WorkProjectObj | SideProjectObj)[] =
    kind === 'work'
      ? [...WorkProjects].sort((a, b) => b.projectID - a.projectID)
      : SideProjects;

  return (
    <group ref={ref} visible={visible}>
      <group ref={innerRef}>
        {SLOTS.map((slot) => {
          const idx = (index + slot.offset + all.length) % all.length;
          const p = all[idx];
          if (!p) return null;

          const { imageUrl, title, description, techStack } = normalizeProject(p);

          return (
            <ProjectCard3D
              key={`${kind}-${idx}`}
              position={slot.position}
              rotationY={slot.rotationY}
              scale={slot.scale}
              imageUrl={imageUrl}
              title={title}
              description={description}
              techStack={techStack}
            />
          );
        })}
      </group>
    </group>
  );
});

ProjectsScene.displayName = 'ProjectsScene';
export default ProjectsScene;
