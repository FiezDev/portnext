'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Github, Globe, Link2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkProjectObj, SideProjectObj } from '@/types/object';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Image from 'next/image';

const IMGIX_BASE = process.env.NEXT_PUBLIC_IMGIX_URL || '';

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

const ProjectCard = ({ project, isActive }: ProjectCardProps) => {
  const isWorkProject = 'projectPic' in project;
  const projectWithLinks = project as ProjectWithLinks;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get status badge variant
  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'Finish':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Parse description bullets
  const descriptions = project.projectDesc.map((desc) =>
    desc.replace(/^- /, '')
  );

  // Get project images for work projects with Imgix URL
  const projectImages = isWorkProject
    ? ((project as WorkProjectObj).projectPic?.picurl?.pic || []).map(
        (path) => `${IMGIX_BASE}${path}`
      )
    : [];

  const hasImages = projectImages.length > 0;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? projectImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === projectImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: isActive ? 1 : 0.5, x: isActive ? 0 : 20 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100 transition-all duration-300',
        isActive ? 'shadow-lg scale-100' : 'shadow-sm scale-95'
      )}
    >
      {/* Left Column - Image Carousel */}
      {hasImages && (
        <div className="md:w-[45%] flex-shrink-0">
          <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={projectImages[currentImageIndex]}
              alt={`${project.projectName} screenshot ${currentImageIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 400px"
            />

            {/* Image Navigation - Only show if multiple images */}
            {projectImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Image Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {projectImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        idx === currentImageIndex
                          ? 'bg-yellow-400 w-4'
                          : 'bg-white/70 hover:bg-white'
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Right Column - Project Info */}
      <div className={`flex flex-col gap-3 ${hasImages ? 'md:w-[55%]' : 'w-full'}`}>
        {/* Project Name and Status */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900">
              {project.projectName}
            </h3>
            {project.projectIntro && (
              <p className="text-sm text-gray-500 mt-1">{project.projectIntro}</p>
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

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <Badge
              key={tech}
              variant="secondary"
              className="text-xs bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-800 transition-colors"
            >
              {tech}
            </Badge>
          ))}
        </div>

        {/* Description */}
        <ul className="space-y-2 text-sm text-gray-600">
          {descriptions.map((desc, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
              <span>{desc}</span>
            </li>
          ))}
        </ul>

        {/* Links */}
        <div className="flex flex-wrap gap-2 pt-2 mt-auto">
          {projectWithLinks.ghlink && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-xs"
              onClick={() =>
                window.open(`https://${projectWithLinks.ghlink}`, '_blank')
              }
            >
              <Github className="w-3 h-3" />
              GitHub
            </Button>
          )}
          {projectWithLinks.weblink && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-xs"
              onClick={() =>
                window.open(
                  projectWithLinks.weblink?.startsWith('http')
                    ? projectWithLinks.weblink
                    : `https://${projectWithLinks.weblink}`,
                  '_blank'
                )
              }
            >
              <Globe className="w-3 h-3" />
              Website
            </Button>
          )}
          {projectWithLinks.apilink && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-xs"
              onClick={() =>
                window.open(`https://${projectWithLinks.apilink}`, '_blank')
              }
            >
              <Link2 className="w-3 h-3" />
              API
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
