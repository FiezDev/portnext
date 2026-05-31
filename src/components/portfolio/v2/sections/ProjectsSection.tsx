'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import GoldHeading from '../shared/GoldHeading';
import ProjectCard from './ProjectCard';
import { WorkProjects, SideProjects } from '@/mocks/projectMock';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Briefcase, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ProjectType = 'work' | 'side';

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const ProjectsSection = () => {
  const [projectType, setProjectType] = useState<ProjectType>('work');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sort work projects by projectID descending
  const sortedWorkProjects = [...WorkProjects].sort(
    (a, b) => b.projectID - a.projectID
  );

  const projects = projectType === 'work' ? sortedWorkProjects : SideProjects;
  const currentProject = projects[currentIndex];

  const handleTypeChange = (type: ProjectType) => {
    setProjectType(type);
    setCurrentIndex(0);
  };

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? projects.length - 1 : prev - 1));
  }, [projects.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === projects.length - 1 ? 0 : prev + 1));
  }, [projects.length]);

  return (
    <motion.div
      className="flex flex-col justify-center h-full p-6 md:p-12 bg-transparent overflow-hidden"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={itemVariants}>
        <GoldHeading as="h2" className="text-4xl md:text-5xl lg:text-6xl mb-6">
          Projects
        </GoldHeading>
      </motion.div>

      {/* Toggle Tabs */}
      <motion.div
        variants={itemVariants}
        className="flex gap-3 mb-6"
      >
        <Button
          onClick={() => handleTypeChange('work')}
          variant={projectType === 'work' ? 'default' : 'outline'}
          size="sm"
          className={cn(
            'gap-2 transition-all font-semibold px-6 py-2',
            projectType === 'work'
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md'
              : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-yellow-400 hover:text-yellow-700'
          )}
        >
          <Briefcase className="w-4 h-4" />
          Work
        </Button>
        <Button
          onClick={() => handleTypeChange('side')}
          variant={projectType === 'side' ? 'default' : 'outline'}
          size="sm"
          className={cn(
            'gap-2 transition-all font-semibold px-6 py-2',
            projectType === 'side'
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md'
              : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-yellow-400 hover:text-yellow-700'
          )}
        >
          <Code2 className="w-4 h-4" />
          Side
        </Button>
      </motion.div>

      {/* Carousel Container */}
      <motion.div variants={itemVariants} className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${projectType}-${currentIndex}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ProjectCard
              project={currentProject}
              index={0}
              isActive={true}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <div className="flex items-center justify-between mt-4">
          <Button
            onClick={handlePrev}
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-yellow-100 hover:text-yellow-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          {/* Dot Indicators */}
          <div className="flex gap-2">
            {projects.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  index === currentIndex
                    ? 'bg-yellow-500 w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                )}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-yellow-100 hover:text-yellow-700"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Project Counter */}
        <p className="text-center text-sm text-gray-400 mt-2">
          {currentIndex + 1} / {projects.length}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ProjectsSection;
