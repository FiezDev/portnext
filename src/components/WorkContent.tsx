'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, resolveImageSrc } from '@/lib/utils';
import { WorkProjects } from '@/mocks/projectMock';
import GoldHeading from '@/components/portfolio/v2/shared/GoldHeading';

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

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
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

const WorkContent = () => {
  const projects = [...WorkProjects].sort((a, b) => b.projectID - a.projectID);

  return (
    <main className="min-h-screen w-full seembg text-white">
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <GoldHeading as="h1" className="text-4xl md:text-6xl mt-6">
            Work
          </GoldHeading>
          <p className="text-white/60 mt-3 max-w-xl">
            Selected projects I&apos;ve shipped — click any card for the full
            case study.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.ul
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
        >
          {projects.map((project) => {
            const firstImage = project.projectPic?.picurl?.pic?.[0];
            const imageSrc = firstImage ? resolveImageSrc(firstImage) : '';
            const shownStack = project.stack.slice(0, 5);
            const extra = project.stack.length - shownStack.length;

            return (
              <motion.li key={project.projectID} variants={itemVariants}>
                <Link
                  href={`/work/${project.projectID}`}
                  className="group block h-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/[0.07] transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative w-full h-44 bg-black/40 overflow-hidden">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={`${project.projectName} preview`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white/20 text-sm">
                        {project.projectName}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                          {project.projectName}
                        </h3>
                        {project.projectIntro && (
                          <p className="text-sm text-white/50 mt-0.5">
                            {project.projectIntro}
                          </p>
                        )}
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                    </div>

                    {project.status && (
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs px-2 py-0.5 w-fit',
                          getStatusVariant(project.status)
                        )}
                      >
                        {project.status}
                      </Badge>
                    )}

                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {shownStack.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="text-[11px] bg-white/10 text-white/70 border-transparent"
                        >
                          {tech}
                        </Badge>
                      ))}
                      {extra > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-[11px] bg-transparent text-white/40 border-transparent"
                        >
                          +{extra} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </main>
  );
};

export default WorkContent;
