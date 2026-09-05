'use client';

import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import GoldHeading, { KICKER } from '../shared/GoldHeading';
import { MORPH_LAYOUT_TRANSITION } from '../shared/useMorphTransition';
import Lightbox from '../shared/Lightbox';
import {
  filterGalleryItems,
  toGalleryItems,
  type GalleryCategory,
  type GalleryItem,
} from '@/lib/workGallery';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ArrowUpRight,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Code2,
  Github,
  Globe,
  Link2,
  Maximize2,
  X,
} from 'lucide-react';

const gridVariants: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const cardVariants: Variants = {
  initial: { opacity: 0, y: 70, rotateX: 24, scale: 0.94 },
  animate: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 130, damping: 18 },
  },
  exit: {
    opacity: 0,
    scale: 0.88,
    rotateY: 24,
    transition: { duration: 0.25 },
  },
};

const cardVariantsReduced: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalContentVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
};

const modalSectionVariants: Variants = {
  hidden: { opacity: 0, y: 22, rotateX: 16 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { type: 'spring', stiffness: 170, damping: 20 },
  },
};

const modalSectionVariantsReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
};

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

const externalHref = (link: string) =>
  link.startsWith('http') ? link : `https://${link}`;

const ProjectsSection = () => {
  const [projectType, setProjectType] = useState<GalleryCategory>('work');
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  const items = filterGalleryItems(toGalleryItems(), projectType);

  // Esc to close + body scroll lock while the modal is open.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [selected]);

  const handleTypeChange = (type: GalleryCategory) => {
    setProjectType(type);
    setSelected(null);
    setImgIndex(0);
  };

  const openProject = (item: GalleryItem) => {
    setSelected(item);
    setImgIndex(0);
  };

  const enterVariants = reducedMotion ? cardVariantsReduced : cardVariants;
  const hoverProps = reducedMotion
    ? undefined
    : {
        whileHover: { y: -8, scale: 1.02, rotateX: 6, rotateY: -5 },
        whileTap: { scale: 0.98 },
      };
  const sectionVariants = reducedMotion
    ? modalSectionVariantsReduced
    : modalSectionVariants;

  const selectedImages = selected?.images ?? [];
  const prevImg = () =>
    setImgIndex((i) =>
      selectedImages.length ? (i === 0 ? selectedImages.length - 1 : i - 1) : 0
    );
  const nextImg = () =>
    setImgIndex((i) =>
      selectedImages.length ? (i === selectedImages.length - 1 ? 0 : i + 1) : 0
    );

  return (
    <motion.div
      className="flex flex-col min-h-full gap-4 md:gap-5 p-5 md:p-8 lg:p-10 pb-24 bg-transparent"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header: kicker + title left, segmented filter right */}
      <div className="flex items-end justify-between gap-4 shrink-0">
        <div>
          <motion.p
            layoutId="page-kicker"
            transition={MORPH_LAYOUT_TRANSITION}
            className={cn(KICKER, 'mb-1.5')}
          >
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
                'relative flex items-center gap-1.5 rounded-full px-3.5 sm:px-5 py-1.5 text-sm font-semibold transition-colors cursor-pointer',
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

      {/* Masonry grid — cards flip in staggered 3D, tilt on hover */}
      <motion.div
        variants={gridVariants}
        initial="initial"
        animate="animate"
        style={{ perspective: 1500 }}
        className="columns-1 sm:columns-2 xl:columns-3 gap-4 md:gap-5"
      >
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={`${projectType}-${item.id}`}
              variants={enterVariants}
              {...hoverProps}
              layout
              className="mb-4 md:mb-5 break-inside-avoid"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.button
                layoutId={`project-card-${item.id}`}
                onClick={() => openProject(item)}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                className="group relative block w-full text-left rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-amber-300 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 ring-1 ring-black/[0.03] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-colors cursor-pointer"
                aria-label={`Open ${item.name} details`}
              >
                {/* Screenshot at its natural aspect */}
                <div
                  className="relative w-full bg-gray-100 overflow-hidden [transform-style:preserve-3d] group-hover:[transform:translateZ(30px)] transition-transform duration-500"
                  style={{ aspectRatio: item.aspect }}
                >
                  {item.images[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={`${item.name} preview`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-300">
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                  {/* Shine sweep */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                  {item.status && (
                    <span
                      className={cn(
                        'absolute top-3 right-3 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                        getStatusVariant(item.status)
                      )}
                    >
                      {item.status}
                    </span>
                  )}
                </div>

                {/* Name + description */}
                <div className="p-4 md:p-5">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                    {item.name}
                  </h3>
                  {item.intro && (
                    <p className="mt-1 text-sm leading-relaxed text-gray-600 line-clamp-3">
                      {item.intro}
                    </p>
                  )}
                </div>
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Detail modal — shared-element morph from the clicked card */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="project-modal-root"
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="absolute inset-0 bg-stone-900/45 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />
            <motion.div
              layoutId={`project-card-${selected.id}`}
              transition={
                reducedMotion
                  ? { duration: 0.2 }
                  : { type: 'spring', stiffness: 260, damping: 28 }
              }
              role="dialog"
              aria-modal="true"
              aria-label={`${selected.name} details`}
              className="relative z-10 w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white border border-gray-200 shadow-2xl shadow-stone-900/30 ring-1 ring-black/[0.03]"
            >
              <motion.div
                variants={modalContentVariants}
                initial="hidden"
                animate="show"
                style={{ perspective: 1200 }}
              >
                {/* Screenshot gallery */}
                <motion.div
                  variants={sectionVariants}
                  className="group relative w-full bg-gray-100 overflow-hidden"
                  style={{ aspectRatio: selected.aspect }}
                >
                  {selected.images[imgIndex] ? (
                    <Image
                      src={selected.images[imgIndex]}
                      alt={`${selected.name} screenshot ${imgIndex + 1}`}
                      fill
                      className="object-contain p-1 md:p-2"
                      sizes="(max-width: 768px) 100vw, 768px"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-gray-300">
                      {selected.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
                  <button
                    onClick={() => setSelected(null)}
                    className="absolute top-3 right-3 rounded-full bg-white/90 border border-gray-200 p-2 text-gray-600 hover:text-gray-900 hover:border-amber-400 shadow-sm transition-colors cursor-pointer"
                    aria-label="Close details"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomOpen(true)}
                    className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-black/55 px-2.5 py-1.5 text-[11px] text-white/90 hover:bg-yellow-500 transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" /> Zoom
                  </button>
                  {selected.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImg}
                        aria-label="Previous screenshot"
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-yellow-500 text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={nextImg}
                        aria-label="Next screenshot"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-yellow-500 text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {selected.images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setImgIndex(idx)}
                            aria-label={`Screenshot ${idx + 1}`}
                            className={cn(
                              'h-2 rounded-full transition-all cursor-pointer',
                              idx === imgIndex
                                ? 'bg-yellow-400 w-4'
                                : 'bg-white/50 hover:bg-white w-2'
                            )}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>

                {/* Body */}
                <div className="p-5 md:p-7">
                  <motion.div
                    variants={sectionVariants}
                    className="flex flex-wrap items-center gap-3"
                  >
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                      {selected.name}
                    </h3>
                    {selected.status && (
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs px-2 py-1',
                          getStatusVariant(selected.status)
                        )}
                      >
                        {selected.status}
                      </Badge>
                    )}
                    <span className="rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
                      {selected.category === 'work' ? 'Work' : 'Side project'}
                    </span>
                  </motion.div>

                  {selected.intro && (
                    <motion.p
                      variants={sectionVariants}
                      className="mt-3 text-[15px] md:text-base leading-relaxed text-gray-800"
                    >
                      {selected.intro}
                    </motion.p>
                  )}

                  <motion.ul
                    variants={sectionVariants}
                    className="mt-4 space-y-2 text-sm md:text-[15px] leading-relaxed text-gray-600"
                  >
                    {selected.desc.map((d, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0" />
                        <span>{d.replace(/^- /, '')}</span>
                      </li>
                    ))}
                  </motion.ul>

                  <motion.div
                    variants={sectionVariants}
                    className="mt-5 flex flex-wrap gap-2"
                  >
                    {selected.stack.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="text-xs md:text-sm px-2.5 py-1 bg-gray-100 text-gray-700 border border-gray-200 hover:bg-yellow-100 hover:text-yellow-800 transition-colors"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </motion.div>

                  <motion.div
                    variants={sectionVariants}
                    className="mt-6 flex flex-wrap items-center gap-2"
                  >
                    {selected.caseStudyHref && (
                      <Link
                        href={selected.caseStudyHref}
                        className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-yellow-500/25 hover:bg-yellow-400 transition-colors"
                      >
                        Full case study
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    )}
                    {selected.ghlink && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs bg-white/80 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 hover:border-yellow-500"
                        onClick={() =>
                          window.open(externalHref(selected.ghlink!), '_blank')
                        }
                      >
                        <Github className="w-3 h-3" /> GitHub
                      </Button>
                    )}
                    {selected.weblink && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs bg-white/80 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 hover:border-yellow-500"
                        onClick={() =>
                          window.open(externalHref(selected.weblink!), '_blank')
                        }
                      >
                        <Globe className="w-3 h-3" /> Website
                      </Button>
                    )}
                    {selected.apilink && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs bg-white/80 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 hover:border-yellow-500"
                        onClick={() =>
                          window.open(externalHref(selected.apilink!), '_blank')
                        }
                      >
                        <Link2 className="w-3 h-3" /> API
                      </Button>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screenshot zoom — reuses the v2 lightbox */}
      {selected && selectedImages.length > 0 && (
        <Lightbox
          images={selectedImages}
          index={imgIndex}
          open={zoomOpen}
          onClose={() => setZoomOpen(false)}
          onIndexChange={setImgIndex}
          alt={`${selected.name} screenshot`}
        />
      )}
    </motion.div>
  );
};

export default ProjectsSection;
