'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  Github,
  Globe,
  Link2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkProjectObj, SideProjectObj } from '@/types/object';
import { cn, resolveImageSrc } from '@/lib/utils';
import { useState } from 'react';
import Image from 'next/image';
import Lightbox from '../shared/Lightbox';

interface ProjectCardProps {
  project: WorkProjectObj | SideProjectObj;
  index: number;
  isActive: boolean;
}

type ProjectWithLinks = WorkProjectObj & {
  ghlink?: string;
  weblink?: string;
  apilink?: string;
};

type TabId = 'overview' | 'details' | 'stack';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'details', label: 'Details' },
  { id: 'stack', label: 'Stack' },
];

const ProjectCard = ({ project }: ProjectCardProps) => {
  const isWorkProject = 'projectPic' in project;
  const projectWithLinks = project as ProjectWithLinks;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [tab, setTab] = useState<TabId>('overview');

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'Finish':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Ongoing':
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const descriptions = project.projectDesc.map((desc) => desc.replace(/^- /, ''));

  const projectImages = (
    isWorkProject
      ? (project as WorkProjectObj).projectPic?.picurl?.pic || []
      : (project as SideProjectObj).pic || []
  ).map(resolveImageSrc);

  const hasImages = projectImages.length > 0;

  const prevImg = () =>
    setCurrentImageIndex((p) => (p === 0 ? projectImages.length - 1 : p - 1));
  const nextImg = () =>
    setCurrentImageIndex((p) => (p === projectImages.length - 1 ? 0 : p + 1));

  const Bullets = ({ items }: { items: string[] }) => (
    <ul className="space-y-2 text-sm md:text-[15px] leading-relaxed text-gray-600">
      {items.map((desc, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0" />
          <span>{desc}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col lg:flex-row lg:h-full min-h-0 gap-4 lg:gap-6 p-4 md:p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 shadow-xl ring-1 ring-black/[0.03]"
    >
      {/* Image — fills the card's left column at a fixed share */}
      {hasImages && (
        <div className="lg:w-[46%] lg:flex-shrink-0 lg:self-stretch lg:flex lg:items-center lg:min-h-0">
          <div className="group relative w-full aspect-[16/10] max-h-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="absolute inset-0 z-[1] cursor-zoom-in"
              aria-label="Zoom screenshot"
            />
            <Image
              src={projectImages[currentImageIndex]}
              alt={`${project.projectName} screenshot ${currentImageIndex + 1}`}
              fill
              className="object-contain p-1"
              sizes="(max-width: 768px) 100vw, 45vw"
            />

            {/* Zoom hint */}
            <div className="pointer-events-none absolute top-2 right-2 z-[2] flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-[11px] text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-3 h-3" /> Zoom
            </div>

            {/* In-card image nav (multiple screenshots) */}
            {projectImages.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  aria-label="Previous screenshot"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-[2] w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-yellow-500 text-white flex items-center justify-center shadow-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                </button>
                <button
                  onClick={nextImg}
                  aria-label="Next screenshot"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-[2] w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-yellow-500 text-white flex items-center justify-center shadow-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[2] flex gap-1.5">
                  {projectImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      aria-label={`Screenshot ${idx + 1}`}
                      className={cn(
                        'h-2 rounded-full transition-all',
                        idx === currentImageIndex
                          ? 'bg-yellow-400 w-4'
                          : 'bg-white/50 hover:bg-white w-2'
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Info — fixed-height column; tabs keep long copy inside the frame */}
      <div
        className={cn(
          'flex flex-col gap-3 min-w-0 min-h-0',
          hasImages ? 'lg:w-[52%]' : 'w-full'
        )}
      >
        {/* Title row — always visible */}
        <div className="flex items-start justify-between gap-3 shrink-0">
          <h3
            className="text-lg md:text-xl font-bold text-gray-900 truncate"
            title={project.projectName}
          >
            {project.projectName}
          </h3>
          {isWorkProject && (project as WorkProjectObj).status && (
            <Badge
              variant="outline"
              className={cn(
                'text-xs px-2 py-1 flex-shrink-0',
                getStatusVariant((project as WorkProjectObj).status)
              )}
            >
              {(project as WorkProjectObj).status}
            </Badge>
          )}
        </div>

        {/* Tab bar */}
        <div
          role="tablist"
          className="flex gap-1 border-b border-gray-200 shrink-0"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                '-mb-px px-3 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer',
                tab === t.id
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content — fixed frame on mobile, fills remaining height on desktop */}
        <div className="h-44 md:h-52 lg:h-auto lg:flex-1 min-h-0 overflow-y-auto pr-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {/* Overview is the HEADLINE, nothing more: one or two sentences a
                  visitor can read at a glance. Details is the long form. The old
                  Overview repeated the first bullets and clamped them, so it read
                  as a truncated Details rather than a summary. */}
              {tab === 'overview' && (
                <div className="space-y-4">
                  <p className="text-[15px] md:text-base leading-relaxed text-gray-800">
                    {project.projectIntro || descriptions[0]}
                  </p>
                  {descriptions.length > 0 && (
                    <button
                      onClick={() => setTab('details')}
                      className="cursor-pointer text-xs font-semibold text-amber-600 hover:text-amber-700"
                    >
                      Read the full detail →
                    </button>
                  )}
                </div>
              )}

              {tab === 'details' && <Bullets items={descriptions} />}

              {tab === 'stack' && (
                <div className="flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="text-xs md:text-sm px-2.5 py-1 bg-gray-100 text-gray-700 border border-gray-200 hover:bg-yellow-100 hover:text-yellow-800 transition-colors"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Links — pinned to the card bottom */}
        {(projectWithLinks.ghlink ||
          projectWithLinks.weblink ||
          projectWithLinks.apilink) && (
          <div className="flex flex-wrap gap-2 pt-1 mt-auto shrink-0">
            {projectWithLinks.ghlink && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-xs bg-white/80 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 hover:border-yellow-500"
                onClick={() =>
                  window.open(`https://${projectWithLinks.ghlink}`, '_blank')
                }
              >
                <Github className="w-3 h-3" /> GitHub
              </Button>
            )}
            {projectWithLinks.weblink && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-xs bg-white/80 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 hover:border-yellow-500"
                onClick={() =>
                  window.open(
                    projectWithLinks.weblink?.startsWith('http')
                      ? projectWithLinks.weblink
                      : `https://${projectWithLinks.weblink}`,
                    '_blank'
                  )
                }
              >
                <Globe className="w-3 h-3" /> Website
              </Button>
            )}
            {projectWithLinks.apilink && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-xs bg-white/80 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 hover:border-yellow-500"
                onClick={() =>
                  window.open(`https://${projectWithLinks.apilink}`, '_blank')
                }
              >
                <Link2 className="w-3 h-3" /> API
              </Button>
            )}
          </div>
        )}
      </div>

      {hasImages && (
        <Lightbox
          images={projectImages}
          index={currentImageIndex}
          open={zoomOpen}
          onClose={() => setZoomOpen(false)}
          onIndexChange={setCurrentImageIndex}
          alt={`${project.projectName} screenshot`}
        />
      )}
    </motion.div>
  );
};

export default ProjectCard;
