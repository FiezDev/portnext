'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import GoldHeading from '../shared/GoldHeading';
import ProjectCard from './ProjectCard';
import { WorkProjects, SideProjects } from '@/mocks/projectMock';
import { WorkProjectObj, SideProjectObj } from '@/types/object';
import { cn, resolveImageSrc } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Briefcase, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ProjectType = 'work' | 'side';

const firstImage = (p: WorkProjectObj | SideProjectObj): string | null => {
  const pics =
    'projectPic' in p ? p.projectPic?.picurl?.pic : (p as SideProjectObj).pic;
  return pics && pics[0] ? resolveImageSrc(pics[0]) : null;
};

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
};

const ProjectsSection = () => {
  const [projectType, setProjectType] = useState<ProjectType>('work');
  const [currentIndex, setCurrentIndex] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);

  const sortedWorkProjects = [...WorkProjects]
    .filter((p) => p.activeFlag !== false)
    .sort((a, b) => b.projectID - a.projectID);

  const projects = projectType === 'work' ? sortedWorkProjects : SideProjects;
  const currentProject = projects[currentIndex];

  const handleTypeChange = (type: ProjectType) => {
    setProjectType(type);
    setCurrentIndex(0);
  };

  const handlePrev = useCallback(
    () => setCurrentIndex((p) => (p === 0 ? projects.length - 1 : p - 1)),
    [projects.length]
  );
  const handleNext = useCallback(
    () => setCurrentIndex((p) => (p === projects.length - 1 ? 0 : p + 1)),
    [projects.length]
  );

  // Keep the active thumb visible: centered on mobile, left-aligned on desktop.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const active = strip.querySelector<HTMLElement>('[data-active="true"]');
    if (!active) return;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (isMobile) {
      strip.scrollTo({
        left: active.offsetLeft - (strip.clientWidth - active.clientWidth) / 2,
        behavior: 'smooth',
      });
    } else {
      const left = active.offsetLeft;
      const right = left + active.clientWidth;
      if (left < strip.scrollLeft || right > strip.scrollLeft + strip.clientWidth) {
        strip.scrollTo({ left: Math.max(0, left - 8), behavior: 'smooth' });
      }
    }
  }, [currentIndex, projectType, projects.length]);

  const toggleBtn = (active: boolean) =>
    cn(
      'gap-2 font-semibold px-4 sm:px-5 py-2 transition-all',
      active
        ? 'bg-yellow-500 hover:bg-yellow-500 text-white shadow-md shadow-yellow-500/20'
        : 'bg-white/70 border border-gray-200 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300'
    );

  return (
    <motion.div
      className="flex flex-col min-h-full p-5 md:p-8 lg:p-10 bg-transparent"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Header row: title (left) + Work/Side toggle (right) */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between gap-4 mb-4"
      >
        <GoldHeading as="h2" className="text-3xl md:text-5xl">
          Projects
        </GoldHeading>
        <div className="flex gap-2 sm:gap-3 shrink-0">
          <Button
            onClick={() => handleTypeChange('work')}
            size="sm"
            className={toggleBtn(projectType === 'work')}
          >
            <Briefcase className="w-4 h-4" />
            <span>Work</span>
          </Button>
          <Button
            onClick={() => handleTypeChange('side')}
            size="sm"
            className={toggleBtn(projectType === 'side')}
          >
            <Code2 className="w-4 h-4" />
            <span>Side</span>
          </Button>
        </div>
      </motion.div>

      {/* Thumbnail navigator — full width, above the card */}
      <motion.div variants={itemVariants} className="mb-4 w-full">
        <div className="flex items-center gap-2 w-full">
          <Button
            onClick={handlePrev}
            variant="ghost"
            size="icon"
            aria-label="Previous project"
            className="shrink-0 rounded-full text-gray-600 hover:bg-yellow-100 hover:text-yellow-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div ref={stripRef} className="flex-1 overflow-x-auto">
            <div className="flex gap-2 pb-1">
              {projects.map((p, index) => {
                const img = firstImage(p);
                const active = index === currentIndex;
                return (
                  <button
                    key={`${p.projectName}-${index}`}
                    data-active={active}
                    onClick={() => setCurrentIndex(index)}
                    title={p.projectName}
                    aria-label={p.projectName}
                    aria-current={active}
                    className={cn(
                      'group relative shrink-0 w-24 h-16 sm:w-28 sm:h-[72px] rounded-lg overflow-hidden border transition-all',
                      active
                        ? 'ring-2 ring-yellow-400 border-yellow-400 opacity-100 scale-[1.03]'
                        : 'border-gray-200 opacity-60 hover:opacity-100'
                    )}
                  >
                    {img ? (
                      <Image
                        src={img}
                        alt={p.projectName}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center px-1 text-center text-[10px] leading-tight text-gray-600 bg-gray-100">
                        {p.projectName}
                      </span>
                    )}
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-black/60 px-1 py-0.5 text-[9px] text-white/90">
                      {p.projectName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            onClick={handleNext}
            variant="ghost"
            size="icon"
            aria-label="Next project"
            className="shrink-0 rounded-full text-gray-600 hover:bg-yellow-100 hover:text-yellow-700"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {currentIndex + 1} / {projects.length} · {currentProject?.projectName}
        </p>
      </motion.div>

      {/* Card — full width */}
      <motion.div variants={itemVariants} className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${projectType}-${currentIndex}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.28 }}
          >
            <ProjectCard project={currentProject} index={0} isActive />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ProjectsSection;
