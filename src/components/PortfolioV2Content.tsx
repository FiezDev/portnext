'use client';

import { cn } from '@/lib/utils';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { PortfolioCanvas } from './portfolio/v2/PortfolioCanvas';
import GoldCursor from './portfolio/v2/shared/GoldCursor';
import HeroVideoOverlay from './portfolio/v2/shared/HeroVideoOverlay';
import { useHeroTransition } from './portfolio/v2/shared/useHeroTransition';
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

const PortfolioV2Content = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('Main');
  const [gameActive, setGameActive] = useState(false);
  const previousPageRef = useRef<PageId>('Main');
  const reducedMotion = useReducedMotion();

  // Plain page swap (also used by the video transition while covered)
  const commitPage = useCallback((newPage: PageId) => {
    setCurrentPage((prev) => {
      if (newPage === prev) return prev;
      previousPageRef.current = prev;
      return newPage;
    });
  }, []);

  const hero = useHeroTransition({
    currentPage,
    reduced: !!reducedMotion,
    commit: commitPage,
  });

  // Cinematic path when possible, existing slide otherwise
  const handlePageChange = useCallback(
    (newPage: PageId) => {
      if (newPage === currentPage) return;
      if (!hero.requestTransition(newPage)) {
        commitPage(newPage);
      }
    },
    [commitPage, currentPage, hero]
  );

  // Keyboard navigation (disabled while the game is running — focus mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameActive || hero.phase !== 'idle') return;
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
  }, [currentPage, handlePageChange, gameActive, hero.phase]);

  return (
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
        <PortfolioCanvas
          currentPage={currentPage}
          previousPage={previousPageRef.current}
          onGameActiveChange={setGameActive}
          clearing={hero.phase === 'clearing'}
        />
      </div>

      {/* Cinematic Main→X transition clip */}
      <HeroVideoOverlay phase={hero.phase} src={hero.activeClip} onSkip={hero.skip} />

      {/* Fixed Bottom Navigation Menu — hidden during the word-hunt game (focus mode) */}
      <AnimatePresence>
        {!gameActive && (
          <motion.div
            key="bottom-nav"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-0 left-0 w-full z-[100] flex items-center justify-center gap-1 p-2 bg-[#1A1A1A] backdrop-blur-md border-t border-white/10 shadow-2xl"
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
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[#FBBF24] rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
    </div>
  );
};

export default PortfolioV2Content;
