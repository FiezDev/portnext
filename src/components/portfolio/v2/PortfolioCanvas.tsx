'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useMemo } from 'react';
import { useCloudText } from './hooks/useCloudText';
import { GoldenContainer } from './shared/GoldenLayout';
import { PageContent } from './shared/PageContent';
import { PageId, useComplexTransition } from './shared/useComplexTransition';

interface PortfolioCanvasProps {
  currentPage: PageId;
  previousPage?: PageId;
}

export const PortfolioCanvas = ({ currentPage, previousPage }: PortfolioCanvasProps) => {
  const prevPageRef = useRef<PageId>(currentPage);
  const fromPage = previousPage || prevPageRef.current;

  // Update ref
  useEffect(() => {
    prevPageRef.current = currentPage;
  }, [currentPage]);

  const { variants: pageVariants, transition: pageTransition } = useComplexTransition(fromPage, currentPage);

  // Only show background elements on Main page
  const showBackground = currentPage === 'Main';

  // Text cloud config - only runs when on Main page
  const cloudConfig = {
    position: { x: 800, y: 500 },
    color: '#FBBF24',
    colorFlag: showBackground,
    glowFlag: showBackground,
    sortingType: 1
  };

  const { layers } = useCloudText(cloudConfig);

  // Memoize layers to prevent unnecessary re-renders
  const memoizedLayers = useMemo(() => layers, [layers]);

  return (
    <GoldenContainer className="bg-transparent overflow-hidden">
      <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            className="w-full h-full bg-transparent flex items-center justify-center relative"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <div className="relative w-full h-full bg-transparent overflow-hidden">

              {/* Text Cloud Background - Only on Main */}
              {showBackground && memoizedLayers.map((layer, layerIndex) => (
                <motion.div
                  key={`layer-${layerIndex}`}
                  className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none z-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  transition={{ duration: 1, delay: layerIndex * 0.1 }}
                  style={{ filter: layer.blur, zIndex: layerIndex }}
                >
                  <svg
                    viewBox="0 0 1000 1000"
                    preserveAspectRatio="xMidYMid slice"
                    className="w-full h-full"
                    style={{ overflow: 'visible' }}
                  >
                    {layer.items.map((item, itemIndex) => {
                      const animDuration = 3 + Math.random() * 2;
                      const animDelay = Math.random() * 2;

                      return (
                        <motion.text
                          key={`${layerIndex}-${itemIndex}`}
                          x={item.x}
                          y={item.y}
                          fontFamily="monospace"
                          fontWeight="bold"
                          fontSize={item.fontSize}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${item.rotation}, ${item.x}, ${item.y})`}
                          fill="rgba(80,85,95,0.7)"
                          initial={{ opacity: 0.3 }}
                          animate={{
                            opacity: item.isHighlighted ? 0 : [0.3, 0.75, 0.3],
                          }}
                          transition={{
                            opacity: { duration: animDuration, repeat: Infinity, ease: "easeInOut", delay: animDelay },
                          }}
                        >
                          {item.text}
                        </motion.text>
                      );
                    })}
                  </svg>
                </motion.div>
              ))}

              {/* Portrait Visual - Only on Main */}
              {showBackground && (
                <div className="absolute top-0 h-full pointer-events-none left-0 w-full min-[1366px]:left-auto min-[1366px]:right-0 min-[1366px]:w-[38.2%] z-0 hidden md:block">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <motion.div
                      className="absolute bottom-0 w-full h-full z-20 flex items-end pointer-events-none justify-start min-[1366px]:justify-end"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                    >
                      <img
                        src="/images/user-portrait.png"
                        alt="Portrait"
                        loading="eager"
                        className="object-contain object-left-bottom min-[1366px]:object-bottom drop-shadow-2xl h-[90%] w-full opacity-20 min-[1366px]:opacity-100"
                      />
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Content - Full width on non-Main pages, 61.8% on Main */}
              <div className={`h-full overflow-y-auto relative z-20 bg-transparent ${showBackground ? 'w-full md:w-[61.8%]' : 'w-full'}`}>
                <PageContent page={currentPage} />
              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </GoldenContainer>
  );
};
