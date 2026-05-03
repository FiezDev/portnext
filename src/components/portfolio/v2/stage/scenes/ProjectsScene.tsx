'use client';

import { forwardRef } from 'react';
import type { Group } from 'three';
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

  const all: (WorkProjectObj | SideProjectObj)[] =
    kind === 'work'
      ? [...WorkProjects].sort((a, b) => b.projectID - a.projectID)
      : SideProjects;

  return (
    <group ref={ref} visible={visible}>
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
  );
});

ProjectsScene.displayName = 'ProjectsScene';
export default ProjectsScene;
