'use client';

import { Fragment, ReactNode, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Github,
  Globe,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import GoldHeading from '@/components/portfolio/v2/shared/GoldHeading';
import type { WorkProjectObj } from '@/types/object';

const IMGIX_BASE = process.env.NEXT_PUBLIC_IMGIX_URL || '';

const FILL_IN_RE = /(\{\{[^}]*\}\})/g;

/** Render a string, highlighting any {{FILL IN ...}} tokens as muted amber pills. */
const renderWithFillIns = (text: string): ReactNode => {
  const parts = text.split(FILL_IN_RE);
  return parts.map((part, i) => {
    if (FILL_IN_RE.test(part)) {
      const label = part.replace(/^\{\{\s*/, '').replace(/\s*\}\}$/, '');
      return (
        <span
          key={i}
          className="inline-block mx-0.5 rounded-md border border-dashed border-amber-400/50 bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-300/90 align-middle"
          title="Placeholder — fill this in"
        >
          {label}
        </span>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
};

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

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.5 }}
    className="border-t border-white/10 pt-8"
  >
    <GoldHeading as="h2" className="text-xl md:text-2xl mb-3">
      {title}
    </GoldHeading>
    {children}
  </motion.section>
);

const CaseStudyView = ({ project }: { project: WorkProjectObj }) => {
  const images = (project.projectPic?.picurl?.pic || []).map(
    (p) => `${IMGIX_BASE}${p}`
  );
  const [index, setIndex] = useState(0);
  const hasImages = images.length > 0;
  const cs = project.caseStudy;
  const highlights = cs?.highlights ?? project.projectDesc;

  const prev = () =>
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () =>
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <main className="min-h-screen w-full seembg text-white">
      <article className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to work
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {project.status && (
              <Badge
                variant="outline"
                className={cn('text-xs', getStatusVariant(project.status))}
              >
                {project.status}
              </Badge>
            )}
            {cs?.timeline && (
              <span className="text-sm text-white/50">
                {renderWithFillIns(cs.timeline)}
              </span>
            )}
          </div>

          <GoldHeading as="h1" className="text-3xl md:text-5xl mt-3">
            {project.projectName}
          </GoldHeading>
          {project.projectIntro && (
            <p className="text-white/60 mt-3 text-lg">{project.projectIntro}</p>
          )}

          {/* Tech stack */}
          <div className="flex flex-wrap gap-2 mt-5">
            {project.stack.map((tech) => (
              <Badge
                key={tech}
                variant="secondary"
                className="text-xs bg-white/10 text-white/70 border-transparent"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </motion.header>

        {/* Gallery */}
        {hasImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="relative mt-10 rounded-2xl overflow-hidden border border-white/10 bg-black/40"
          >
            <div className="relative w-full aspect-video">
              <Image
                src={images[index]}
                alt={`${project.projectName} screenshot ${index + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label="Previous screenshot"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  aria-label="Next screenshot"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      aria-label={`Go to screenshot ${i + 1}`}
                      className={cn(
                        'h-2 rounded-full transition-all',
                        i === index
                          ? 'bg-amber-400 w-4'
                          : 'bg-white/40 hover:bg-white/70 w-2'
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Body */}
        <div className="mt-12 flex flex-col gap-10">
          {cs ? (
            <>
              <Section title="The Problem">
                <p className="text-white/70 leading-relaxed">
                  {renderWithFillIns(cs.problem)}
                </p>
              </Section>

              <Section title="My Role">
                <p className="text-white/70 leading-relaxed">
                  {renderWithFillIns(cs.role)}
                </p>
              </Section>

              <Section title="Approach & Key Decisions">
                <ul className="flex flex-col gap-3">
                  {cs.approach.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2.5 flex-shrink-0" />
                      <span className="leading-relaxed">
                        {renderWithFillIns(item)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Highlights">
                <ul className="flex flex-col gap-3">
                  {highlights.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2.5 flex-shrink-0" />
                      <span className="leading-relaxed">
                        {renderWithFillIns(item.replace(/^- /, ''))}
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Outcome">
                <p className="text-white/70 leading-relaxed">
                  {renderWithFillIns(cs.outcome)}
                </p>
              </Section>
            </>
          ) : (
            <Section title="Overview">
              <ul className="flex flex-col gap-3">
                {project.projectDesc.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2.5 flex-shrink-0" />
                    <span className="leading-relaxed">
                      {renderWithFillIns(item.replace(/^- /, ''))}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Links */}
          {(cs?.repoUrl || cs?.liveUrl) && (
            <div className="flex flex-wrap gap-3 border-t border-white/10 pt-8">
              {cs?.repoUrl && (
                <a
                  href={
                    cs.repoUrl.startsWith('http')
                      ? cs.repoUrl
                      : `https://${cs.repoUrl}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    className="gap-2 border-white/20 bg-transparent text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <Github className="w-4 h-4" />
                    Repository
                  </Button>
                </a>
              )}
              {cs?.liveUrl && (
                <a
                  href={
                    cs.liveUrl.startsWith('http')
                      ? cs.liveUrl
                      : `https://${cs.liveUrl}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    className="gap-2 border-white/20 bg-transparent text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <Globe className="w-4 h-4" />
                    Live site
                  </Button>
                </a>
              )}
            </div>
          )}
        </div>
      </article>
    </main>
  );
};

export default CaseStudyView;
