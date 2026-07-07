'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import GoldHeading, { KICKER } from '../shared/GoldHeading';
import { MORPH_LAYOUT_TRANSITION } from '../shared/useMorphTransition';
import ProjectCard from './ProjectCard';
import { WorkProjects, SideProjects } from '@/mocks/projectMock';
import { WorkProjectObj, SideProjectObj } from '@/types/object';
import { cn, resolveImageSrc } from '@/lib/utils';
import { Briefcase, ChevronLeft, ChevronRight, Code2 } from 'lucide-react';
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

  // Horizontal strip (below lg): scroll affordances for mouse users —
  // edge fades + chevron buttons + vertical-wheel → horizontal translation.
  const stripRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  const updateScrollHints = useCallback(() => {
    const el = stripRef.current;
    if (!el) return;
    setCanScroll({
      left: el.scrollLeft > 4,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 4,
    });
  }, []);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    updateScrollHints();
    el.addEventListener('scroll', updateScrollHints, { passive: true });
    window.addEventListener('resize', updateScrollHints);
    // Mouse path = the chevron buttons (+ native shift-wheel / trackpad pan).
    // A wheel-hijack handler was removed here: it preventDefault()ed even at
    // the strip's ends, trapping page scroll (review finding).
    return () => {
      el.removeEventListener('scroll', updateScrollHints);
      window.removeEventListener('resize', updateScrollHints);
    };
  }, [updateScrollHints, projectType]);

  const nudgeStrip = (dir: 1 | -1) =>
    stripRef.current?.scrollBy({ left: dir * 500, behavior: 'smooth' });

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
          <motion.p layoutId="page-kicker" transition={MORPH_LAYOUT_TRANSITION} className={cn(KICKER, 'mb-1.5')}>
            03 · Selected Work
          </motion.p>
          <GoldHeading
            as="h2"
            layoutId="page-heading"
            transition={MORPH_LAYOUT_TRANSITION}
            className="text-4xl md:text-5xl lg:text-6xl"
          >
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
            <span className="font-mono text-xs text-gray-500">
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

        {/* Selector rail — horizontal strip above the card on mobile, vertical list on desktop.
            touch-pan-x claims horizontal swipes on touch devices (iOS was
            letting the page's vertical scroller swallow them). Edge fades +
            chevrons signal scrollability and give mouse users a click path. */}
        <div className="relative order-first lg:order-none lg:w-[38.2%] lg:min-h-0 lg:flex lg:flex-col">
          {canScroll.left && (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#FAFAF9] to-transparent lg:hidden" />
              <button
                onClick={() => nudgeStrip(-1)}
                aria-label="Scroll projects left"
                className="absolute left-1 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-amber-600 shadow-md lg:hidden"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </>
          )}
          {canScroll.right && (
            <>
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#FAFAF9] to-transparent lg:hidden" />
              <button
                onClick={() => nudgeStrip(1)}
                aria-label="Scroll projects right"
                className="absolute right-1 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-amber-600 shadow-md motion-safe:animate-pulse lg:hidden"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </>
          )}
        <div ref={stripRef} className="min-h-0 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto pb-1 lg:pb-0 lg:pr-1 touch-pan-x lg:touch-auto overscroll-x-contain snap-x">
          {projects.map((p, index) => {
            const img = firstImage(p);
            const active = index === featuredIndex;
            return (
              <button
                key={`${projectType}-${p.projectName}-${index}`}
                onClick={() => setFeaturedIndex(index)}
                aria-current={active}
                className={cn(
                  'group flex items-center gap-3 rounded-xl border p-2 pr-3 text-left transition-all cursor-pointer shrink-0 w-60 lg:w-auto snap-start',
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
                    <span className="flex h-full items-center justify-center text-sm font-bold text-gray-500">
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
      </div>
    </motion.div>
  );
};

export default ProjectsSection;
