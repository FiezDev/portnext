'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import GoldHeading from '../shared/GoldHeading';
import ProjectCard from './ProjectCard';
import { WorkProjects, SideProjects } from '@/mocks/projectMock';
import { WorkProjectObj, SideProjectObj } from '@/types/object';
import { cn, resolveImageSrc } from '@/lib/utils';
import { Briefcase, Code2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  bentoSpanClass,
  bentoSpanForImage,
  nextFeatured,
  driftTarget,
} from './bentoLayout';

type ProjectType = 'work' | 'side';

const DRIFT_RANGE = 20; // px — keeps the grid inside its padding while it wanders
const DRIFT_INTERVAL_MS = 2000;
const FEATURE_ROTATE_MS = 5000;

const firstImage = (p: WorkProjectObj | SideProjectObj): string | null => {
  const pics =
    'projectPic' in p ? p.projectPic?.picurl?.pic : (p as SideProjectObj).pic;
  return pics && pics[0] ? resolveImageSrc(pics[0]) : null;
};

const ProjectsSection = () => {
  const [projectType, setProjectType] = useState<ProjectType>('work');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [cardHidden, setCardHidden] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [drift, setDrift] = useState({ x: 0, y: 0 });
  const reducedMotion = useReducedMotion();

  const sortedWorkProjects = [...WorkProjects]
    .filter((p) => p.activeFlag !== false)
    .sort((a, b) => b.projectID - a.projectID);

  const projects = projectType === 'work' ? sortedWorkProjects : SideProjects;
  const featuredProject = projects[featuredIndex];

  // Grid drift: pick a new random direction every 2s, tween toward it.
  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(
      () => setDrift(driftTarget(Math.random, DRIFT_RANGE)),
      DRIFT_INTERVAL_MS
    );
    return () => clearInterval(id);
  }, [reducedMotion]);

  // Featured card auto-rotates every 5s. Any selection change (manual click,
  // type switch, hide) restarts the countdown via the deps.
  useEffect(() => {
    if (hoverPaused || projects.length === 0) return;
    const id = setTimeout(() => {
      setFeaturedIndex((c) => nextFeatured(c, projects.length));
      setCardHidden(false);
    }, FEATURE_ROTATE_MS);
    return () => clearTimeout(id);
  }, [featuredIndex, hoverPaused, cardHidden, projectType, projects.length]);

  const handleTypeChange = (type: ProjectType) => {
    setProjectType(type);
    setFeaturedIndex(0);
    setCardHidden(false);
  };

  const selectProject = (index: number) => {
    setFeaturedIndex(index);
    setCardHidden(false);
  };

  const toggleBtn = (active: boolean) =>
    cn(
      'gap-2 font-semibold px-4 sm:px-5 py-2 transition-all',
      active
        ? 'bg-yellow-500 hover:bg-yellow-500 text-white shadow-md shadow-yellow-500/20'
        : 'bg-white/70 border border-gray-200 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300'
    );

  return (
    <motion.div
      className="flex flex-col justify-center min-h-full p-5 md:p-8 lg:p-10 pb-24 md:pb-24 lg:pb-28 bg-transparent"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header row: title (left) + Work/Side toggle (right) */}
      <div className="flex items-center justify-between gap-4 mb-5 md:mb-6">
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
      </div>

      {/* Bento grid — drifts slowly toward a new random point every 2s */}
      <motion.div
        animate={{ x: drift.x, y: drift.y }}
        transition={{ duration: DRIFT_INTERVAL_MS / 1000, ease: 'linear' }}
        className="grid grid-cols-2 md:grid-cols-4 grid-flow-dense auto-rows-[96px] md:auto-rows-[120px] gap-3"
      >
        {projects.map((p, index) => {
          const img = firstImage(p);
          const featured = index === featuredIndex && !cardHidden;
          // Tile shape follows the first screenshot's dimensions; side
          // projects have no dims in the mock → cycle the static pattern.
          const dims = 'projectPic' in p ? p.projectPic?.picurl : undefined;
          const span =
            bentoSpanForImage(dims?.width, dims?.height) ?? bentoSpanClass(index);
          return (
            <motion.button
              key={`${projectType}-${p.projectName}-${index}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
              onClick={() => selectProject(index)}
              title={p.projectName}
              aria-label={`Feature ${p.projectName}`}
              aria-current={featured}
              className={cn(
                'group relative overflow-hidden rounded-2xl border text-left cursor-pointer bg-white/70 backdrop-blur-sm transition-[box-shadow,border-color] duration-200',
                span,
                featured
                  ? 'ring-2 ring-yellow-400 border-yellow-400 shadow-lg shadow-yellow-500/20'
                  : 'border-gray-200 hover:border-yellow-300 hover:shadow-lg'
              )}
            >
              {img ? (
                <Image
                  src={img}
                  alt={p.projectName}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <span className="flex h-full items-center justify-center px-2 text-center text-sm font-medium text-gray-600 bg-gray-100">
                  {p.projectName}
                </span>
              )}
              <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2.5 pt-6 pb-1.5 text-xs font-medium text-white">
                {p.projectName}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Featured card — viewport-centered, rotates every 5s, hover pauses */}
      <AnimatePresence mode="wait">
        {featuredProject && !cardHidden && (
          <motion.div
            key={`${projectType}-${featuredIndex}`}
            initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.98 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] flex items-center justify-center px-4 pt-6 pb-24 pointer-events-none"
          >
            <div
              className="pointer-events-auto relative w-[min(60vw,48rem)] max-h-[60vh] overflow-y-auto rounded-2xl shadow-2xl"
              onMouseEnter={() => setHoverPaused(true)}
              onMouseLeave={() => setHoverPaused(false)}
            >
              <button
                onClick={() => setCardHidden(true)}
                aria-label="Hide featured project"
                className="absolute top-2 right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white hover:bg-yellow-500 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              {/* ponytail: hover-pause misses the portal Lightbox; lift zoom state up if card swaps mid-zoom annoys */}
              <ProjectCard project={featuredProject} index={0} isActive />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProjectsSection;
