'use client';

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  MotionValue,
  TargetAndTransition,
  Transition,
} from 'framer-motion';
import { ReactNode, useEffect, useRef, useMemo, useState } from 'react';
import { useCloudText } from './hooks/useCloudText';
import { GoldenContainer } from './shared/GoldenLayout';
import { PageContent } from './shared/PageContent';
import { PageId } from './shared/useComplexTransition';
import { useHeroGame, GAME_DURATION_S } from './game/useHeroGame';
import { GAME_WORD_COUNT } from './game/heroGameLogic';
import GameHUD from './game/GameHUD';
import CloudWord from './game/CloudWord';

interface PortfolioCanvasProps {
  currentPage: PageId;
  previousPage?: PageId;
  onGameActiveChange?: (active: boolean) => void;
  /** Walk-in film still playing: every element shows immediately EXCEPT the
   *  word cloud, which waits for the film to end and then fades in. */
  hideCloud?: boolean;
  /** Walk-in film playing: live portrait stays hidden until ~0.2s before the
   *  clip ends, then fades in over the film's landing frames. */
  hidePortrait?: boolean;
}

// Depth wrapper: deeper (more blurred) cloud layers drift more with the
// mouse, giving the Main background a parallax feel.
const ParallaxLayer = ({
  mx,
  my,
  depth,
  className,
  style,
  children,
  animate,
  transition,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
  depth: number;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
  animate?: TargetAndTransition;
  transition?: Transition;
}) => {
  const x = useTransform(mx, (v) => v * depth);
  const y = useTransform(my, (v) => v * depth);
  return (
    <motion.div
      className={className}
      style={{ ...style, x, y }}
      initial={{ opacity: 0 }}
      animate={animate}
      transition={transition}
    >
      {children}
    </motion.div>
  );
};

export const PortfolioCanvas = ({ currentPage, previousPage, onGameActiveChange, hideCloud = false, hidePortrait = false }: PortfolioCanvasProps) => {
  // Measure the board area so the game uses a 1:1 pixel viewBox → the same word
  // size on every screen (mobile-first, no scale-up).
  const boardRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState({ w: 1000, h: 800 });
  useEffect(() => {
    const el = boardRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const update = () =>
      setBoard({ w: Math.round(el.clientWidth) || 1000, h: Math.round(el.clientHeight) || 800 });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const game = useHeroGame();
  const reduced = useReducedMotion();
  const isGame = game.phase !== 'idle';
  const prevPageRef = useRef<PageId>(currentPage);
  const fromPage = previousPage || prevPageRef.current;

  // Mouse parallax for the cloud layers (-1..1 from board center, springed).
  const rawMx = useMotionValue(0);
  const rawMy = useMotionValue(0);
  const parallaxX = useSpring(rawMx, { stiffness: 50, damping: 18 });
  const parallaxY = useSpring(rawMy, { stiffness: 50, damping: 18 });

  // Update ref
  useEffect(() => {
    prevPageRef.current = currentPage;
  }, [currentPage]);

  // Report game-active state up so the shell can hide the bottom nav (focus mode).
  useEffect(() => {
    onGameActiveChange?.(isGame);
  }, [isGame, onGameActiveChange]);

  // Pages crossfade in place (popLayout overlaps old+new trees) so shared
  // layoutId elements — kicker, heading, rule, portrait, motto — FLIP-morph
  // between their two layouts. Slides would drag the morphing elements.
  void fromPage;

  // Only show background elements on Main page
  const showBackground = currentPage === 'Main';

  // Text cloud config - only runs when on Main page
  const cloudConfig = {
    position: { x: 800, y: 500 },
    color: '#FBBF24',
    colorFlag: showBackground,
    glowFlag: showBackground,
    sortingType: 1,
    count: isGame ? GAME_WORD_COUNT : 80,
    gameActive: isGame,
    seed: game.seed,
    gameViewW: board.w,
    gameViewH: board.h,
  };

  const { layers } = useCloudText(cloudConfig);

  // Memoize layers to prevent unnecessary re-renders
  const memoizedLayers = useMemo(() => layers, [layers]);

  return (
    // relative z-10 keeps the whole page ABOVE the z-[5] hero film — the
    // page's own opacity animations create z-auto contexts that would
    // otherwise lose to the film.
    <GoldenContainer className="bg-transparent overflow-hidden relative z-10">
      <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentPage}
            className="w-full h-full bg-transparent flex items-center justify-center relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <div
              ref={boardRef}
              className="relative w-full h-full bg-transparent overflow-hidden"
              onMouseMove={(e) => {
                if (reduced || isGame || !showBackground) return;
                const r = e.currentTarget.getBoundingClientRect();
                rawMx.set(((e.clientX - r.left) / r.width) * 2 - 1);
                rawMy.set(((e.clientY - r.top) / r.height) * 2 - 1);
              }}
              onMouseLeave={() => {
                rawMx.set(0);
                rawMy.set(0);
              }}
            >

              {/* Text Cloud Background - Only on Main (becomes the game board in game mode) */}
              {showBackground && memoizedLayers.map((layer, layerIndex) => (
                <ParallaxLayer
                  key={`layer-${layerIndex}`}
                  mx={parallaxX}
                  my={parallaxY}
                  depth={isGame || reduced ? 0 : 8 + layerIndex * 7}
                  className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none select-none"
                  animate={{ opacity: hideCloud ? 0 : isGame ? 1 : 0.2 }}
                  transition={{ duration: isGame ? 0.5 : 1, delay: hideCloud ? 0 : layerIndex * 0.1 }}
                  style={{ filter: layer.blur, zIndex: isGame ? 30 : layerIndex }}
                >
                  <svg
                    viewBox={isGame ? `0 0 ${board.w} ${board.h}` : '0 0 1000 1000'}
                    preserveAspectRatio={isGame ? 'xMidYMid meet' : 'xMidYMid slice'}
                    className="w-full h-full"
                    style={{ overflow: 'visible' }}
                  >
                    {layer.items.map((item, itemIndex) => {
                      const hit = isGame && game.hitWords.includes(item.text);
                      return (
                        <CloudWord
                          key={`${layerIndex}-${itemIndex}`}
                          item={item}
                          isGame={isGame}
                          isHit={hit}
                          isTarget={isGame && game.phase === 'playing' && game.targets.includes(item.text) && !hit}
                          wrongNonce={isGame && game.lastWrong?.word === item.text ? game.lastWrong.nonce : 0}
                          reduced={!!reduced}
                          onHit={game.registerHit}
                        />
                      );
                    })}
                  </svg>
                </ParallaxLayer>
              ))}

              {/* (portrait moved OUTSIDE the keyed page trees — see below the
                  AnimatePresence. popLayout freezes exiting-tree props, which
                  made the portrait ignore hidePortrait during walk-outs.) */}

              {/* Content - Full width on non-Main pages, 61.8% on Main.
                  Kept mounted but hidden during the game (avoids stagger replay on exit). */}
              <div className={`h-full overflow-y-auto relative z-20 bg-transparent ${showBackground ? 'w-full md:w-[61.8%]' : 'w-full'} ${isGame ? 'opacity-0 pointer-events-none' : ''}`}>
                <PageContent page={currentPage} />
              </div>

              {/* Word-Hunt game HUD (playing/over), Main only. START trigger removed for now;
                  wire game.start() to a new control when ready. */}
              {showBackground && isGame && (
                <GameHUD
                  phase={game.phase}
                  secondsLeft={game.secondsLeft}
                  durationS={GAME_DURATION_S}
                  score={game.score}
                  streak={game.streak}
                  bestStreak={game.bestStreak}
                  best={game.best}
                  targets={game.targets}
                  runKey={game.seed}
                  onQuit={game.quit}
                  onPlayAgain={game.start}
                />
              )}

            </div>
          </motion.div>
        </AnimatePresence>

        {/* Portrait — sibling of the page trees so hidePortrait applies the
            same frame a film starts or ends. ALWAYS MOUNTED: unmounting while
            hidden forced an image re-decode at the film→page cut (a 1–3 frame
            flash — the "blip"). Kept in the DOM and toggled via opacity only,
            the swap is a pure compositor flip. Film navs: instant. Non-film
            navs away from Main: graceful 0.45s fade. */}
        <motion.div
          className="absolute top-0 h-full pointer-events-none left-0 w-full min-[1366px]:left-auto min-[1366px]:right-0 min-[1366px]:w-[38.2%] z-20 hidden md:block"
          initial={false}
          animate={{
            opacity: showBackground && !isGame && !hidePortrait ? 1 : 0,
          }}
          transition={{
            duration: hidePortrait || showBackground ? 0 : 0.45,
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute bottom-0 w-full h-full flex items-end pointer-events-none justify-start min-[1366px]:justify-end">
              <div className="h-[90%] w-full flex items-end justify-start min-[1366px]:justify-end">
                <img
                  src="/images/user-portrait.webp"
                  alt="Portrait"
                  loading="eager"
                  decoding="sync"
                  className="object-contain object-left-bottom min-[1366px]:object-right-bottom drop-shadow-2xl h-full w-full opacity-20 min-[1366px]:opacity-100"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </GoldenContainer>
  );
};
