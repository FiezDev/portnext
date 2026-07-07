'use client';

import { cn } from '@/lib/utils';
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import { Briefcase, Home, Mail, Sparkles, User } from 'lucide-react';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { PortfolioCanvas } from './portfolio/v2/PortfolioCanvas';
import FilmUnderlay from './portfolio/v2/shared/FilmUnderlay';
import GoldCursor from './portfolio/v2/shared/GoldCursor';
import { useMorphTransition } from './portfolio/v2/shared/useMorphTransition';
import { PageId, PAGE_ORDER, getAdjacentPage } from './portfolio/v2/shared/useComplexTransition';

// Nav button that leans toward the cursor (desktop micro-interaction).
const MagneticButton = ({
  onClick,
  className,
  children,
}: {
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) => {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 350, damping: 22, mass: 0.5 });
  const y = useSpring(my, { stiffness: 350, damping: 22, mass: 0.5 });

  return (
    <motion.button
      onClick={onClick}
      className={className}
      style={reduced ? undefined : { x, y }}
      onMouseMove={(e) => {
        if (reduced) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - (r.left + r.width / 2)) * 0.25);
        my.set((e.clientY - (r.top + r.height / 2)) * 0.35);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {children}
    </motion.button>
  );
};

const PAGE_ITEMS: PageId[] = PAGE_ORDER;

// Mobile bar shows the same menu as icons
const MOBILE_NAV_ICONS: Record<PageId, typeof Home> = {
  Main: Home,
  About: User,
  Skill: Sparkles,
  Projects: Briefcase,
  Contact: Mail,
};

const PortfolioV2Content = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('Main');
  const [gameActive, setGameActive] = useState(false);
  const previousPageRef = useRef<PageId>('Main');
  const reducedMotion = useReducedMotion();

  const morph = useMorphTransition(!!reducedMotion);

  // Every navigation IS the transition: pages crossfade while shared
  // elements (kicker/heading/rule/portrait/motto) FLIP-morph between
  // layouts. Ink splatters + the faded graffiti film dress the travel.
  const handlePageChange = useCallback(
    (newPage: PageId) => {
      setCurrentPage((prev) => {
        if (newPage === prev) return prev;
        previousPageRef.current = prev;
        return newPage;
      });
      if (newPage !== currentPage) {
        morph.onNavigate(currentPage, newPage); // origin decides the film
      }
    },
    [currentPage, morph]
  );

  // Keyboard navigation (disabled while the game is running — focus mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameActive) return;
      // Never steal arrows from form fields / editable targets (H1: caret
      // movement was navigating away and wiping typed input).
      const t = e.target as HTMLElement | null;
      if (t?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (e.altKey || e.metaKey || e.ctrlKey) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const nextPage = getAdjacentPage(currentPage, 'next');
        if (nextPage && nextPage !== currentPage) {
          handlePageChange(nextPage);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const prevPage = getAdjacentPage(currentPage, 'prev');
        if (prevPage && prevPage !== currentPage) {
          handlePageChange(prevPage);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, handlePageChange, gameActive]);

  return (
    // reducedMotion="user": framer does NOT auto-honor the OS setting for
    // layout/layoutId animations — this gates the morph FLIPs (films are
    // already gated in the hook).
    <MotionConfig reducedMotion="user">
    <div className="relative w-full min-h-screen bg-white overflow-hidden font-sans flex justify-center">

      {/* Gold cursor accent — desktop pointers only */}
      <GoldCursor />

      {/* Global Background - Noise Style */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-stone-50/50 to-amber-50/30" />
          <div 
            className="absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
      </div>

      {/* Main Content - Max width 1366px, centered, relative to sit above background */}
      <div
        className="w-full h-screen relative z-10"
        style={{ maxWidth: 'var(--max-content-width, 1366px)' }}
      >
        {/* Hero film — full-opacity walk-out/walk-in on Main↔X navs, cage-aligned */}
        <FilmUnderlay
          film={morph.film}
          onEnded={morph.onFilmEnded}
          onPlaying={morph.onFilmPlaying}
        />
        <PortfolioCanvas
          currentPage={currentPage}
          previousPage={previousPageRef.current}
          onGameActiveChange={setGameActive}
          hideCloud={morph.hideCloud}
          hidePortrait={morph.hidePortrait}
        />
      </div>

      {/* Fixed Bottom Navigation Menu (desktop) — hidden during the word-hunt game */}
      <AnimatePresence>
        {!gameActive && (
          <motion.div
            key="bottom-nav"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-0 left-0 w-full z-[100] hidden md:flex items-center justify-center gap-1 p-2 bg-[#1A1A1A] backdrop-blur-md border-t border-white/10 shadow-2xl"
          >
            {PAGE_ITEMS.map((page, pageIndex) => (
            <MagneticButton
                key={page}
                onClick={() => handlePageChange(page)}
                className={cn(
                  'relative px-4 md:px-5 py-2.5 rounded-full text-[11px] md:text-xs font-bold uppercase tracking-widest transition-colors duration-300 cursor-pointer',
                  currentPage === page
                    ? 'text-stone-900'
                    : 'text-gray-400 hover:text-white'
                )}
            >
                {currentPage === page && (
                <motion.div
                    className="absolute inset-0 bg-[#FBBF24] rounded-full"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                />
                )}
                <span className="relative z-10 flex items-baseline gap-1.5">
                  <span
                    className={cn(
                      'font-mono text-[9px] font-medium',
                      currentPage === page ? 'text-stone-700' : 'text-gray-500'
                    )}
                  >
                    0{pageIndex}
                  </span>
                  {page}
                </span>
            </MagneticButton>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile navigation — same bar, items as icons */}
      <AnimatePresence>
        {!gameActive && (
          <motion.div
            key="mobile-nav"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-0 left-0 w-full z-[100] flex md:hidden items-center justify-center gap-1 p-2 bg-[#1A1A1A] backdrop-blur-md border-t border-white/10 shadow-2xl"
          >
            {PAGE_ITEMS.map((page, pageIndex) => {
              const Icon = MOBILE_NAV_ICONS[page];
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  aria-label={`0${pageIndex} ${page}`}
                  className={cn(
                    'relative flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300',
                    currentPage === page ? 'text-stone-900' : 'text-gray-400'
                  )}
                >
                  {currentPage === page && (
                    <motion.div
                      className="absolute inset-0 bg-[#FBBF24] rounded-full"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    />
                  )}
                  <Icon className="relative z-10 h-5 w-5" />
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </MotionConfig>
  );
};

export default PortfolioV2Content;
