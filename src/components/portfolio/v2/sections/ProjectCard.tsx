'use client';

import { motion } from 'framer-motion';
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

const ProjectCard = ({ project }: ProjectCardProps) => {
  const isWorkProject = 'projectPic' in project;
  const projectWithLinks = project as ProjectWithLinks;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'Finish':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Ongoing':
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 md:p-5 rounded-2xl bg-slate-50/95 backdrop-blur-md border border-yellow-500/40 shadow-2xl ring-1 ring-black/5"
    >
      {/* Image */}
      {hasImages && (
        <div className="lg:w-[48%] lg:flex-shrink-0 flex">
          <div className="group relative w-full h-56 sm:h-72 lg:h-full lg:min-h-[340px] rounded-xl overflow-hidden bg-black/40 border border-white/10">
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-[2] w-8 h-8 rounded-full bg-black/55 hover:bg-yellow-500/80 text-white flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImg}
                  aria-label="Next screenshot"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-[2] w-8 h-8 rounded-full bg-black/55 hover:bg-yellow-500/80 text-white flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
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

      {/* Info */}
      <div className={cn('flex flex-col gap-3 min-w-0', hasImages ? 'lg:w-[52%]' : 'w-full')}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg md:text-xl font-bold text-slate-900">
              {project.projectName}
            </h3>
            {project.projectIntro && (
              <p className="text-sm text-slate-500 mt-1">{project.projectIntro}</p>
            )}
          </div>
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

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <Badge
              key={tech}
              variant="secondary"
              className="text-xs bg-slate-100 text-slate-700 border border-slate-200 hover:bg-yellow-100 hover:text-yellow-800 transition-colors"
            >
              {tech}
            </Badge>
          ))}
        </div>

        {/* Description */}
        <ul className="space-y-2 text-[15px] leading-relaxed text-slate-700">
          {descriptions.map((desc, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0" />
              <span>{desc}</span>
            </li>
          ))}
        </ul>

        {/* Links */}
        {(projectWithLinks.ghlink ||
          projectWithLinks.weblink ||
          projectWithLinks.apilink) && (
          <div className="flex flex-wrap gap-2 pt-1 mt-auto">
            {projectWithLinks.ghlink && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-xs bg-white border-slate-300 text-slate-700 hover:bg-yellow-50 hover:text-yellow-800 hover:border-yellow-400"
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
                className="gap-1 text-xs bg-white border-slate-300 text-slate-700 hover:bg-yellow-50 hover:text-yellow-800 hover:border-yellow-400"
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
                className="gap-1 text-xs bg-white border-slate-300 text-slate-700 hover:bg-yellow-50 hover:text-yellow-800 hover:border-yellow-400"
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
