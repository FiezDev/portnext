'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCloudText } from './hooks/useCloudText';
import { GoldenContainer } from './shared/GoldenLayout';
import { PageContent } from './shared/PageContent';
import { PageId } from './shared/useComplexTransition';

interface PortfolioCanvasProps {
  currentPage: PageId;
}

export const PortfolioCanvas = ({ currentPage }: PortfolioCanvasProps) => {

  // Hook Configuration (Could be props if needed later)
  const cloudConfig = {
      position: { x: 800, y: 500 }, // Matches previous VIRTUAL_CENTER
      color: '#FBBF24',
      colorFlag: true,
      glowFlag: true,
      sortingType: 1
  };

  const { layers } = useCloudText(cloudConfig);

  const depthVariants = {
      initial: { opacity: 0, z: -500, rotateY: 90 },
      animate: { opacity: 1, z: 0, rotateY: 0, transition: { duration: 0.8 } },
      exit: { opacity: 0, z: 100, rotateY: -90, transition: { duration: 0.6 } }
  };

  return (
    <GoldenContainer className="bg-transparent perspective-[1000px] overflow-hidden">

        {/* 3D Scene Container */}
        <div className="w-full h-full relative flex items-center justify-center perspective-[2000px] overflow-hidden">
             <AnimatePresence mode="wait">
                <motion.div
                    key={currentPage}
                    className="w-full h-full bg-transparent flex items-center justify-center relative transform-style-3d"
                    variants={depthVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{ transformStyle: 'preserve-3d' }}
                >

                    {/* Unified Card Content */}
                    <div className="relative w-full h-full bg-transparent overflow-hidden">
                        
                        {/* 1. Global Background Text Cloud */}
                        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                             {layers.map((layer, layerIndex) => (
                                <motion.div
                                    key={layerIndex}
                                    className="absolute inset-0 overflow-hidden flex items-center justify-center"
                                    initial={{ translateZ: layer.z - 50, opacity: 0 }}
                                    animate={{ translateZ: layer.z - 50, opacity: 0.2 }} // Base opacity for container
                                    transition={{ 
                                        duration: 1.5,
                                        delay: layerIndex * 0.2
                                    }}
                                    style={{ 
                                        filter: layer.blur,
                                        zIndex: 0
                                    }}
                                >
                                    <svg 
                                        viewBox="0 0 1000 1000" 
                                        preserveAspectRatio="xMidYMid slice" 
                                        className="w-full h-full opacity-100"
                                        style={{ overflow: 'visible' }}
                                    >
                                        {layer.items.map((item, itemIndex) => {
                                            // Animation Logic
                                            // If highlighted: Glow with color
                                            // If not highlighted: Silver breathe if glowFlag is true
                                            
                                            const isHighlighted = item.isHighlighted;
                                            const shouldGlow = item.shouldGlow;
                                            
                                            // Random timing for silver breathing (derived from index to be deterministic per render)
                                            const animDelay = ((layerIndex * 17 + itemIndex * 31) % 100) / 100 * 2;
                                            const animDuration = 2.5 + ((layerIndex + itemIndex) % 2) * 0.5;

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
                                                        className="select-none pointer-events-none"
                                                        
                                                        // Fill color: Highlight color OR Gray
                                                        fill={isHighlighted ? item.highlightColor : "rgba(80,85,95,0.7)"}
                                                        
                                                        initial={{ opacity: 0.3 }}
                                                        
                                                        animate={{ 
                                                            opacity: isHighlighted 
                                                                ? 1 // Highlight opacity
                                                                : shouldGlow 
                                                                    ? [0.3, 0.75, 0.3] // Breathing
                                                                    : 0.3, // Static
                                                            
                                                            filter: isHighlighted 
                                                                ? 'drop-shadow(0px 0px 8px rgba(251, 191, 36, 0.8))' // Gold glow
                                                                : shouldGlow
                                                                    ? [
                                                                        'drop-shadow(0px 0px 0px transparent)',
                                                                        'drop-shadow(0px 0px 8px rgba(192, 208, 224, 0.9))', // Silver glow
                                                                        'drop-shadow(0px 0px 0px transparent)'
                                                                    ]
                                                                    : 'none'
                                                        }}
                                                        
                                                        transition={isHighlighted ? {
                                                            opacity: { duration: 1.5, ease: "easeInOut" },
                                                            filter: { duration: 1.5, ease: "easeInOut" },
                                                        } : {
                                                            opacity: { duration: animDuration, repeat: Infinity, ease: "easeInOut", delay: animDelay },
                                                            filter: { duration: animDuration, repeat: Infinity, ease: "easeInOut", delay: animDelay },
                                                        }}
                                                    >
                                                        {item.text}
                                                    </motion.text>
                                            );
                                        })} 
                                    </svg>
                                </motion.div>
                            ))}
                        </div>

                        {/* Right Side: Portrait Visual - Responsive Behavior */}
                        {/* < 768px: Hidden */}
                        {/* 768px - 1365px: Background Left, Subtle Opacity */}
                        {/* >= 1366px: Right Side, Full Opacity */}
                        <div className="absolute top-0 h-full pointer-events-none perspective-[1000px] left-0 w-full min-[1366px]:left-auto min-[1366px]:right-0 min-[1366px]:w-[38.2%] z-0 min-[1366px]:z-10 hidden md:block">
                            <div className="relative w-full h-full flex items-center justify-center transform-style-3d">
                                 {/* Foreground Portrait Image */}
                                <motion.div 
                                    className="absolute bottom-0 w-[100%] h-[100%] z-20 flex items-end pointer-events-none justify-start min-[1366px]:justify-end"
                                    initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    style={{ transformStyle: 'preserve-3d', translateZ: 50 }}
                                >
                                     <img 
                                        src="/images/user-portrait.png" 
                                        alt="Portrait" 
                                        className="object-contain object-left-bottom min-[1366px]:object-bottom drop-shadow-2xl h-[90%] w-full opacity-20 min-[1366px]:opacity-100"
                                     />
                                </motion.div>
                                </div>
                        </div>

                        {/* Left Side: Content */}
                        <div className="h-full w-full md:w-[61.8%] overflow-y-auto relative z-20 bg-transparent">
                            <PageContent page={currentPage} />
                        </div>

                    </div>
                </motion.div>
             </AnimatePresence>
        </div>
    </GoldenContainer>
  );
};
