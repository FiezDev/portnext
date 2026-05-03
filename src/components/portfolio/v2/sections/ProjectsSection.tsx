'use client';

import { useRef } from 'react';
import GoldHeading from '../shared/GoldHeading';
import { WorkProjects, SideProjects } from '@/mocks/projectMock';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Briefcase, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjectsState, ProjectKind } from '../stage/projectsState';
import { useScrollyEntrance } from '../gsap/useScrollyEntrance';
import { useStageEnabled } from '@/hooks/useStageEnabled';
import ProjectCard from './ProjectCard';

const ProjectsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  useScrollyEntrance(ref);
  const stageOn = useStageEnabled();
  const { kind, index, setKind, setIndex, next, prev } = useProjectsState();
  const projects = kind === 'work'
    ? [...WorkProjects].sort((a, b) => b.projectID - a.projectID)
    : SideProjects;
  const currentProject = projects[index];

  return (
    <div ref={ref} className="flex flex-col justify-center h-full p-6 md:p-12 bg-transparent pointer-events-none">
      <div data-stagger>
        <GoldHeading as="h2" className="text-4xl md:text-5xl lg:text-6xl mb-6">Projects</GoldHeading>
      </div>
      <div data-stagger className="flex gap-3 mb-6 pointer-events-auto">
        {(['work', 'side'] as ProjectKind[]).map(k => (
          <Button key={k} onClick={() => setKind(k)} variant={kind === k ? 'default' : 'outline'} size="sm"
            className={cn('gap-2 font-semibold px-6 py-2',
              kind === k ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-white border-2 border-gray-300')}>
            {k === 'work' ? <Briefcase className="w-4 h-4" /> : <Code2 className="w-4 h-4" />}
            {k === 'work' ? 'Work' : 'Side'}
          </Button>
        ))}
      </div>
      {!stageOn && currentProject && (
        <div data-stagger className="pointer-events-auto mb-4" style={{ perspective: 1000 }}>
          <div style={{ transform: 'rotateY(0deg)' }}>
            <ProjectCard project={currentProject} index={0} isActive />
          </div>
        </div>
      )}
      <div data-stagger className="flex items-center justify-between mt-auto pointer-events-auto">
        <Button onClick={() => prev(projects.length)} variant="ghost" size="icon" className="rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex gap-2">
          {projects.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)}
              className={cn('w-2 h-2 rounded-full transition-all duration-300',
                i === index ? 'bg-yellow-500 w-6' : 'bg-gray-300 hover:bg-gray-400')} />
          ))}
        </div>
        <Button onClick={() => next(projects.length)} variant="ghost" size="icon" className="rounded-full">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
      <p className="text-center text-sm text-gray-400 mt-2">{index + 1} / {projects.length}</p>
    </div>
  );
};

export default ProjectsSection;
