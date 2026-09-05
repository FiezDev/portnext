'use client';

import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
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
  initial: { opacity: 0, y: 60, rotateX: 22, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 130, damping: 18 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    rotateY: 20,
    transition: { duration: 0.25 },
  },
};

const cardVariantsReduced: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
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

type TabId = 'overview' | 'details' | 'stack';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'details', label: 'Details' },
  { id: 'stack', label: 'Stack' },
];

const pad = (n: number) => String(n + 1).padStart(2, '0');

const ProjectsSection = () => {
  const [projectType, setProjectType] = useState<GalleryCategory>('work');
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [modalFrom, setModalFrom] = useState<DOMRect | null>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [tab, setTab] = useState<TabId>('overview');
  // Fixed tab-content height: measured ONCE per project as the tallest of
  // the three tabs, so the modal never changes height when switching tabs.
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const measureRef = useRef<HTMLDivElement>(null);
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

  // After the modal mounts at the clicked card's rect, expand it to center.
  useEffect(() => {
    if (!selected || !modalFrom) return;
    const id = requestAnimationFrame(() => setModalFrom(null));
    return () => cancelAnimationFrame(id);
  }, [selected, modalFrom]);

  // Measure the tallest tab once per project and freeze the content height.
  useEffect(() => {
    if (!selected) {
      setContentHeight(null);
      return;
    }
    const id = requestAnimationFrame(() => {
      const el = measureRef.current;
      if (!el) return;
      const tallest = Math.max(
        160,
        ...Array.from(el.children).map((child) =>
          Math.ceil((child as HTMLElement).getBoundingClientRect().height)
        )
      );
      setContentHeight(tallest);
    });
    return () => cancelAnimationFrame(id);
  }, [selected]);

  const openProject = (item: GalleryItem, el: HTMLElement) => {
    setModalFrom(el.getBoundingClientRect());
    setImgIndex(0);
    setTab('overview');
    setSelected(item);
  };

  const handleTypeChange = (type: GalleryCategory) => {
    setProjectType(type);
    setSelected(null);
    setImgIndex(0);
  };

  const enterVariants = reducedMotion ? cardVariantsReduced : cardVariants;

  const renderTab = (id: TabId, item: GalleryItem) => (
    <>
      {id === 'overview' && (
        <div className="space-y-4">
          <p className="text-[15px] leading-relaxed text-gray-800">
            {item.intro || item.desc[0]?.replace(/^- /, '')}
          </p>
          {item.desc.length > 0 && (
            <button
              onClick={() => setTab('details')}
              className="cursor-pointer text-xs font-semibold text-amber-600 hover:text-amber-700"
            >
              Read the full detail →
            </button>
          )}
        </div>
      )}

      {id === 'details' && (
        <ul className="space-y-2 text-sm md:text-[15px] leading-relaxed text-gray-600">
          {item.desc.map((d, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0" />
              <span>{d.replace(/^- /, '')}</span>
            </li>
          ))}
        </ul>
      )}

      {id === 'stack' && (
        <div className="flex flex-wrap gap-2">
          {item.stack.map((tech) => (
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
    </>
  );

  const selectedImages = selected?.images ?? [];
  const prevImg = () =>
    setImgIndex((i) =>
      selectedImages.length ? (i === 0 ? selectedImages.length - 1 : i - 1) : 0
    );
  const nextImg = () =>
    setImgIndex((i) =>
      selectedImages.length ? (i === selectedImages.length - 1 ? 0 : i + 1) : 0
    );

  // Final (centered) modal geometry; the from-rect overrides it on the very
  // first frame so the card appears to expand out of the grid. Fixed
  // positioning — the dialog's left/top are viewport coords.
  const modalStyle: React.CSSProperties = modalFrom
    ? {
        position: 'fixed',
        left: modalFrom.left,
        top: modalFrom.top,
        width: modalFrom.width,
        height: modalFrom.height,
      }
    : {
        position: 'fixed',
        left: '50%',
        top: '50%',
        width: 'min(56rem, calc(100vw - 2rem))',
        maxHeight: 'min(85vh, 40rem)',
        transform: 'translate(-50%, -50%)',
      };

  return (
    <motion.div
      className="flex flex-col min-h-full lg:h-full gap-4 md:gap-5 p-5 md:p-8 lg:p-10 pb-24 lg:pb-10 bg-transparent"
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

      {/* Uniform grid — equal cards, everything in one viewport. The visual
          interest is in the motion: staggered 3D flip-in, amber glow hover,
          shine sweep — not in layout machinery. */}
      <motion.div
        variants={gridVariants}
        initial="initial"
        animate="animate"
        style={{ perspective: 1400 }}
        className="mt-6 md:mt-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 items-start"
      >
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => (
            <motion.button
              key={`${projectType}-${item.id}`}
              variants={enterVariants}
              whileHover={reducedMotion ? undefined : { y: -6 }}
              layout
              onClick={(e) => openProject(item, e.currentTarget)}
              className={cn(
                'group relative flex w-full flex-col text-left rounded-2xl border border-gray-200 bg-white',
                'aspect-[4/3] max-h-[calc((100vh-330px)/2)]',
                'shadow-sm hover:z-10 transition-shadow duration-300',
                'hover:shadow-[0_20px_50px_-12px_rgba(234,179,8,0.45)]',
                'overflow-hidden cursor-pointer',
                'focus-visible:outline-none focus-visible:shadow-[0_0_0_5px_rgba(234,179,8,0.3),0_20px_50px_-12px_rgba(234,179,8,0.45)]'
              )}
              aria-label={`Open ${item.name} details`}
            >
              {/* Contained screenshot with breathing room to the rim */}
              <div className="relative flex-1 min-h-0 p-2 bg-[#f7f6f4] overflow-hidden">
                {item.images[0] ? (
                  <Image
                    src={item.images[0]}
                    alt={`${item.name} preview`}
                    fill
                    draggable={false}
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl font-bold text-gray-300">
                    {item.name.charAt(0)}
                  </div>
                )}
                {/* Editorial index chip */}
                <span className="absolute top-2 left-2 rounded-md bg-white/80 backdrop-blur px-1.5 py-0.5 font-mono text-[10px] font-semibold text-stone-400">
                  {pad(i)}
                </span>
                {item.status && (
                  <span
                    className={cn(
                      'absolute top-2 right-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                      getStatusVariant(item.status)
                    )}
                  >
                    {item.status}
                  </span>
                )}
                {/* Shine sweep */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />
              </div>
              {/* Solid text section */}
              <div className="shrink-0 p-3">
                <h3 className="text-sm md:text-base font-bold text-stone-900 group-hover:text-amber-600 transition-colors">
                  {item.name}
                </h3>
                {item.intro && (
                  <p className="mt-0.5 text-xs leading-relaxed text-stone-600 line-clamp-2">
                    {item.intro}
                  </p>
                )}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Detail modal — expands out of the clicked card, laid out like the
          prior prod card: screenshot column + tabbed info column. */}
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
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`${selected.name} details`}
              style={{
                ...modalStyle,
                transition:
                  'left .55s cubic-bezier(.22,1,.36,1), top .55s cubic-bezier(.22,1,.36,1), width .55s cubic-bezier(.22,1,.36,1), height .55s cubic-bezier(.22,1,.36,1), transform .55s cubic-bezier(.22,1,.36,1)',
              }}
              className="relative z-10 overflow-y-auto rounded-3xl bg-white border border-gray-200 shadow-2xl shadow-stone-900/30 ring-1 ring-black/[0.03]"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Screenshot column — carousel + zoom, like prior prod */}
                <div className="relative lg:w-[46%] shrink-0 p-4 md:p-5 pb-0 lg:p-5 lg:pb-5">
                  <div className="group relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    {selected.images[imgIndex] ? (
                      <Image
                        src={selected.images[imgIndex]}
                        alt={`${selected.name} screenshot ${imgIndex + 1}`}
                        fill
                        className="object-contain p-1"
                        sizes="(max-width: 768px) 100vw, 45vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-gray-300">
                        {selected.name.charAt(0)}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setZoomOpen(true)}
                      className="absolute inset-0 z-[1] cursor-zoom-in"
                      aria-label="Zoom screenshot"
                    />
                    <div className="pointer-events-none absolute top-2 right-2 z-[2] flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-[11px] text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3 h-3" /> Zoom
                    </div>
                    {selected.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImg}
                          aria-label="Previous screenshot"
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-[2] w-10 h-10 rounded-full bg-black/60 hover:bg-yellow-500 text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={nextImg}
                          aria-label="Next screenshot"
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-[2] w-10 h-10 rounded-full bg-black/60 hover:bg-yellow-500 text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[2] flex gap-1.5">
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
                  </div>
                </div>

                {/* Info column — tabs, like prior prod */}
                <div className="relative flex flex-col gap-3 min-w-0 flex-1 p-4 md:p-5 lg:p-5 lg:pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3
                      className="text-lg md:text-xl font-bold text-gray-900 truncate"
                      title={selected.name}
                    >
                      {selected.name}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
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
                      <button
                        onClick={() => setSelected(null)}
                        className="rounded-full border border-gray-200 p-2 text-gray-500 hover:text-gray-900 hover:border-amber-400 transition-colors cursor-pointer"
                        aria-label="Close details"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Tab bar */}
                  <div
                    role="tablist"
                    className="flex gap-1 border-b border-gray-200"
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

                  {/* Tab content — frozen at the tallest tab's height so the
                      modal never resizes when switching tabs */}
                  <div
                    className="overflow-y-auto pr-1"
                    style={contentHeight ? { height: contentHeight } : undefined}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={tab}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                      >
                        {renderTab(tab, selected)}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Hidden measurer — renders all three tabs once per
                      project; the tallest sets the frozen content height */}
                  <div
                    ref={measureRef}
                    aria-hidden
                    className="absolute invisible pointer-events-none h-0 overflow-hidden left-0 right-0"
                  >
                    {TABS.map((t) => (
                      <div key={t.id} className="pr-1">
                        {renderTab(t.id, selected)}
                      </div>
                    ))}
                  </div>

                  {/* Links — pinned to the bottom, like prior prod */}
                  <div className="flex flex-wrap gap-2 pt-1 mt-auto">
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
                  </div>
                </div>
              </div>
            </div>
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
