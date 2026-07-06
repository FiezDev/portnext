'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import GoldHeading, { KICKER } from '../shared/GoldHeading';
import ProjectCard from './ProjectCard';
import { WorkProjects, SideProjects } from '@/mocks/projectMock';
import { WorkProjectObj, SideProjectObj } from '@/types/object';
import { cn, resolveImageSrc } from '@/lib/utils';
import { Briefcase, Code2 } from 'lucide-react';
import { nextFeatured } from './bentoLayout';

type ProjectType = 'work' | 'side';

const FEATURE_ROTATE_MS = 5000;

const firstImage = (p: WorkProjectObj | SideProjectObj): string | null => {
  const pics =
    'projectPic' in p ? p.projectPic?.picurl?.pic : (p as SideProjectObj).pic;
  return pics && pics[0] ? resolveImageSrc(pics[0]) : null;
};

const introOf = (p: WorkProjectObj | SideProjectObj): string =>
  p.projectIntro || p.projectDesc?.[0]?.replace(/^- /, '') || '';

const ProjectsSection = () => {
  const [projectType, setProjectType] = useState<ProjectType>('work');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  const sortedWorkProjects = [...WorkProjects]
    .filter((p) => p.activeFlag !== false)
    .sort((a, b) => b.projectID - a.projectID);

  const projects = projectType === 'work' ? sortedWorkProjects : SideProjects;
  const featuredProject = projects[featuredIndex];

  // Featured auto-rotates every 5s; hover anywhere in the showcase pauses it.
  useEffect(() => {
    if (hoverPaused || projects.length === 0) return;
    const id = setTimeout(
      () => setFeaturedIndex((c) => nextFeatured(c, projects.length)),
      FEATURE_ROTATE_MS
    );
    return () => clearTimeout(id);
  }, [featuredIndex, hoverPaused, projectType, projects.length]);

  const handleTypeChange = (type: ProjectType) => {
    setProjectType(type);
    setFeaturedIndex(0);
  };

  const pad = (n: number) => String(n + 1).padStart(2, '0');

  return (
    <motion.div
      className="flex flex-col lg:justify-center min-h-full lg:h-full gap-4 md:gap-5 p-5 md:p-8 lg:p-10 pb-24 lg:pb-24 bg-transparent"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header: kicker + title left, segmented toggle right */}
      <div className="flex items-end justify-between gap-4 shrink-0">
        <div>
          <p className={cn(KICKER, 'mb-1.5')}>03 · Selected Work</p>
          <GoldHeading as="h2" className="text-4xl md:text-5xl lg:text-6xl">
            Projects
          </GoldHeading>
        </div>
        <div className="flex rounded-full border border-gray-200 bg-white/70 backdrop-blur-sm p-1 shrink-0">
          {(
            [
              ['work', 'Work', Briefcase],
              ['side', 'Side', Code2],
            ] as const
          ).map(([type, label, Icon]) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3.5 sm:px-5 py-1.5 text-sm font-semibold transition-all cursor-pointer',
                projectType === type
                  ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/25'
                  : 'text-gray-600 hover:text-yellow-700'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Showcase: featured panel (major) + selector rail (minor) */}
      <div
        className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0 lg:max-h-[540px]"
        onMouseEnter={() => setHoverPaused(true)}
        onMouseLeave={() => setHoverPaused(false)}
      >
        {/* Featured — in-flow, golden major column; card fills a fixed frame */}
        <div className="lg:w-[61.8%] min-w-0 lg:min-h-0 flex flex-col gap-2">
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-xs text-gray-400">
              {pad(featuredIndex)} / {pad(projects.length - 1)}
            </span>
            <span className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${projectType}-${featuredIndex}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="lg:flex-1 lg:min-h-0 flex flex-col"
            >
              {featuredProject && (
                <ProjectCard project={featuredProject} index={0} isActive />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Selector rail — horizontal strip above the card on mobile, vertical list on desktop */}
        <div className="order-first lg:order-none lg:w-[38.2%] min-h-0 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto pb-1 lg:pb-0 lg:pr-1">
          {projects.map((p, index) => {
            const img = firstImage(p);
            const active = index === featuredIndex;
            return (
              <button
                key={`${projectType}-${p.projectName}-${index}`}
                onClick={() => setFeaturedIndex(index)}
                aria-current={active}
                className={cn(
                  'group flex items-center gap-3 rounded-xl border p-2 pr-3 text-left transition-all cursor-pointer shrink-0 w-60 lg:w-auto',
                  active
                    ? 'border-amber-400 ring-1 ring-amber-400 bg-amber-50/70 shadow-md shadow-amber-500/10'
                    : 'border-gray-200 bg-white/70 hover:border-amber-300 hover:bg-white'
                )}
              >
                <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
                  {img ? (
                    <Image
                      src={img}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="64px"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-sm font-bold text-gray-400">
                      {p.projectName.charAt(0)}
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block truncate text-sm font-semibold',
                      active ? 'text-amber-700' : 'text-gray-800'
                    )}
                  >
                    {p.projectName}
                  </span>
                  <span className="block truncate text-xs text-gray-500">
                    {introOf(p)}
                  </span>
                </span>
                {/* Countdown ring — restarts in sync with the rotate timer */}
                {active && !reducedMotion && (
                  <svg
                    key={`ring-${projectType}-${featuredIndex}-${hoverPaused}`}
                    viewBox="0 0 16 16"
                    className="h-4 w-4 shrink-0 -rotate-90"
                    aria-hidden
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="6.5"
                      fill="none"
                      strokeWidth="1.5"
                      className="stroke-amber-200"
                    />
                    <circle
                      cx="8"
                      cy="8"
                      r="6.5"
                      fill="none"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeDasharray="40.84"
                      className="stroke-amber-500"
                      style={{
                        animation: `railring ${FEATURE_ROTATE_MS}ms linear forwards`,
                        animationPlayState: hoverPaused ? 'paused' : 'running',
                      }}
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectsSection;
