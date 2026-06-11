'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
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
    'projectPic' in p
      ? p.projectPic?.picurl?.pic
      : (p as SideProjectObj).pic;
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

  const toggleBtn = (active: boolean) =>
    cn(
      'gap-2 font-semibold px-5 py-2 transition-all',
      active
        ? 'bg-yellow-500 hover:bg-yellow-500 text-[#1B262C] shadow-md shadow-yellow-500/20'
        : 'bg-white/5 border border-white/15 text-gray-300 hover:bg-white/10 hover:text-yellow-200'
    );

  return (
    <motion.div
      className="flex flex-col h-full p-5 md:p-8 lg:p-10 bg-transparent overflow-hidden"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={itemVariants}>
        <GoldHeading as="h2" className="text-3xl md:text-5xl mb-4">
          Projects
        </GoldHeading>
      </motion.div>

      {/* Work / Side toggle */}
      <motion.div variants={itemVariants} className="flex gap-3 mb-4">
        <Button
          onClick={() => handleTypeChange('work')}
          size="sm"
          className={toggleBtn(projectType === 'work')}
        >
          <Briefcase className="w-4 h-4" /> Work
        </Button>
        <Button
          onClick={() => handleTypeChange('side')}
          size="sm"
          className={toggleBtn(projectType === 'side')}
        >
          <Code2 className="w-4 h-4" /> Side
        </Button>
      </motion.div>

      {/* Card */}
      <motion.div variants={itemVariants} className="flex-1 min-h-0">
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

      {/* Thumbnail navigator */}
      <motion.div variants={itemVariants} className="mt-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrev}
            variant="ghost"
            size="icon"
            aria-label="Previous project"
            className="shrink-0 rounded-full text-gray-300 hover:bg-yellow-500/15 hover:text-yellow-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-2 pb-1 snap-x">
              {projects.map((p, index) => {
                const img = firstImage(p);
                const active = index === currentIndex;
                return (
                  <button
                    key={`${p.projectName}-${index}`}
                    onClick={() => setCurrentIndex(index)}
                    title={p.projectName}
                    aria-label={p.projectName}
                    aria-current={active}
                    className={cn(
                      'group relative shrink-0 snap-start w-24 h-16 sm:w-28 sm:h-[72px] rounded-lg overflow-hidden border transition-all',
                      active
                        ? 'ring-2 ring-yellow-400 border-yellow-400 opacity-100'
                        : 'border-white/10 opacity-55 hover:opacity-100'
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
                      <span className="flex h-full items-center justify-center px-1 text-center text-[10px] leading-tight text-gray-300 bg-white/5">
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
            className="shrink-0 rounded-full text-gray-300 hover:bg-yellow-500/15 hover:text-yellow-300"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <p className="mt-2 text-center text-xs text-gray-500">
          {currentIndex + 1} / {projects.length} · {currentProject?.projectName}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ProjectsSection;
