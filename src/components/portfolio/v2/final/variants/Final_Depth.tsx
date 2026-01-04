'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { GoldenContainer } from '../shared/GoldenLayout';
import { PageContent } from '../shared/PageContent';
import { generateRadialPackedWords } from '../shared/radialPacking';
import { PageId } from '../shared/useComplexTransition';

interface Iter5_DepthProps {
  currentPage: PageId;
}

const Iter5_Depth = ({ currentPage }: Iter5_DepthProps) => {

  const depthVariants = {
      initial: { opacity: 0, z: -500, rotateY: 90 },
      animate: { opacity: 1, z: 0, rotateY: 0, transition: { duration: 0.8 } },
      exit: { opacity: 0, z: 100, rotateY: -90, transition: { duration: 0.6 } }
  };

  // Silhouette Layers (Merged from Final_Silhouette)
  const layers = [
      { scale: 1.5, blur: 'blur(0px)', opacity: 0.1, z: -100 },
      { scale: 1.2, blur: 'blur(0px)', opacity: 0.4, z: -50 },
      { scale: 1.0, blur: 'blur(0px)', opacity: 1.0, z: 0 },
      { scale: 0.9, blur: 'blur(1px)', opacity: 0.6, z: 50 },
  ];

  // Stabilize word cloud generation - uses Radial Packing algorithm
  // Fix Hydration Error: Generate only on client side
  const [wordCloudLayers, setWordCloudLayers] = useState<any[]>([]);

  useEffect(() => {
     // 1. Generate a single master list of words so they don't overlap with each other
     // Reduced from 300 to 150 for better performance
     const totalWords = 150;
     const allWords = generateRadialPackedWords(totalWords);
     
     // 2. Distribute words across layers
     const wordsPerLayer = Math.ceil(totalWords / layers.length);

     const generatedLayers = layers.map((layer, index) => {
         // Slice the master list for this layer
         const layerWords = allWords.slice(index * wordsPerLayer, (index + 1) * wordsPerLayer);
         
         // For SVG viewbox 0 0 1000 1000, center is usually 500.
         // User wants it centered behind the man, who is in the right 38% column.
         // Right column center is approx 62% + (38%/2) = 81%. Let's use 800.
         const VIRTUAL_CENTER_X = 800;
         const VIRTUAL_CENTER_Y = 500;

         const items = layerWords.map(w => ({
             text: w.text,
             x: VIRTUAL_CENTER_X + w.x,
             y: VIRTUAL_CENTER_Y + w.y,
             rotation: w.rotation,
             fontSize: 36
         }));

         return {
             ...layer,
             items
         };
     });

     setWordCloudLayers(generatedLayers);
  }, []); // Run once on mount

  // Animation State for Gold Glow
  const [highlightedIndices, setHighlightedIndices] = useState<Array<{l: number, i: number}>>([]);

  // Cycle the "Gold Spotlight" loop
  useEffect(() => {
     if (wordCloudLayers.length === 0) return;
     
     const interval = setInterval(() => {
         // 1. Pick 5 random words
         const candidates:Array<{l: number, i: number}> = [];
         for (let k = 0; k < 5; k++) {
            const randomLayerIndex = Math.floor(Math.random() * wordCloudLayers.length);
            const layer = wordCloudLayers[randomLayerIndex];
            if (layer && layer.items.length > 0) {
                const randomItemIndex = Math.floor(Math.random() * layer.items.length);
                candidates.push({ l: randomLayerIndex, i: randomItemIndex });
            }
         }
         
         // 2. Trigger Glow (Fade In - takes 1.5s)
          setHighlightedIndices(candidates);

          // 3. Clear Glow after 3.5s (1.5s fade in + 2s hold)
          // Fade out takes 1.5s, completing at 5s when next cycle starts
          setTimeout(() => {
              setHighlightedIndices([]);
          }, 3500);

      }, 5000); // 5s cycle: 1.5s fade in + 2s hold + 1.5s fade out

     return () => clearInterval(interval);
  }, [wordCloudLayers]);

  return (
    <GoldenContainer className="bg-white perspective-[1000px] overflow-hidden">

        {/* 3D Scene Container */}
        <div className="w-full h-full relative flex items-center justify-center perspective-[2000px] overflow-hidden">
             <AnimatePresence mode="wait">
                <motion.div
                    key={currentPage}
                    className="w-full h-full bg-white flex items-center justify-center relative transform-style-3d"
                    variants={depthVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{ transformStyle: 'preserve-3d' }}
                >

                                        {/* Unified Card Content */}
                    <div className="relative w-full h-full bg-white overflow-hidden">
                        
                        {/* 1. Global Background Text Layers (Scattered Word Cloud) */}
                        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                             {wordCloudLayers.map((layer, layerIndex) => (
                                <motion.div
                                    key={layerIndex}
                                    className="absolute inset-0 overflow-hidden flex items-center justify-center"
                                    initial={{ translateZ: layer.z - 50, opacity: 0 }}
                                    animate={{ translateZ: layer.z - 50, opacity: 0.2 }}
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
                                        className="w-full h-full opacity-100" // Full opacity SVG container
                                        style={{ overflow: 'visible' }}
                                    >
                                        {layer.items.map((item: any, itemIndex: number) => {
                                            const isHighlighted = highlightedIndices.some(h => h.l === layerIndex && h.i === itemIndex);
                                            
                                            // Random animation timing for silver breathing
                                            const animDelay = ((layerIndex * 17 + itemIndex * 31) % 100) / 100 * 2;
                                            const animDuration = 2.5 + ((layerIndex + itemIndex) % 2) * 0.5;
                                            
                                            // Common text props
                                            const textProps = {
                                                x: item.x,
                                                y: item.y,
                                                fontFamily: "monospace",
                                                fontWeight: "bold",
                                                fontSize: item.fontSize,
                                                textAnchor: "middle" as const,
                                                dominantBaseline: "middle" as const,
                                                transform: `rotate(${item.rotation}, ${item.x}, ${item.y})`,
                                                className: "select-none pointer-events-none",
                                            };
                                            
                                            return (
                                                <motion.text
                                                        {...textProps}
                                                        fill="rgba(80,85,95,0.7)"
                                                        initial={{ opacity: 0.3 }}
                                                        animate={{ 
                                                            opacity: isHighlighted ? 0 : [0.3, 0.75, 0.3],
                                                            filter: isHighlighted 
                                                                ? 'none' 
                                                                : [
                                                                    'drop-shadow(0px 0px 0px transparent)',
                                                                    'drop-shadow(0px 0px 8px rgba(192, 208, 224, 0.9))',
                                                                    'drop-shadow(0px 0px 0px transparent)'
                                                                ],
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

                        {/* 2. Yellow Glow Layer - Separate from silver, FULL OPACITY */}
                        <div className="absolute inset-0 w-full h-full pointer-events-none z-1">
                            {wordCloudLayers.map((layer, layerIndex) => (
                                <div
                                    key={`yellow-${layerIndex}`}
                                    className="absolute inset-0 overflow-hidden flex items-center justify-center"
                                    style={{ filter: layer.blur }}
                                >
                                    <svg 
                                        viewBox="0 0 1000 1000" 
                                        preserveAspectRatio="xMidYMid slice" 
                                        className="w-full h-full"
                                        style={{ overflow: 'visible' }}
                                    >
                                        {layer.items.map((item: any, itemIndex: number) => {
                                            const isHighlighted = highlightedIndices.some(h => h.l === layerIndex && h.i === itemIndex);
                                            
                                            return (
                                                <motion.text
                                                    key={`${layerIndex}-${itemIndex}-yellow`}
                                                    x={item.x}
                                                    y={item.y}
                                                    fontFamily="monospace"
                                                    fontWeight="bold"
                                                    fontSize={item.fontSize}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    transform={`rotate(${item.rotation}, ${item.x}, ${item.y})`}
                                                    className="select-none pointer-events-none"
                                                    fill="#FBBF24"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: isHighlighted ? 0.8 : 0 }}
                                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                                >
                                                    {item.text}
                                                </motion.text>
                                            );
                                        })}
                                    </svg>
                                </div>
                            ))}
                        </div>

                        {/* Right Side: Portrait Visual (Absolute) - Golden Ratio Small Part (~38.2%) */}
                        <div className="absolute top-0 right-0 w-[38.2%] h-full z-10 pointer-events-none perspective-[1000px] hidden md:block">
                            <div className="relative w-full h-full flex items-center justify-center transform-style-3d">
                                
                                {/* 2. Foreground Portrait Image */}
                                <motion.div 
                                    className="absolute bottom-0 right-0 w-[100%] h-[100%] z-20 flex items-end justify-end pointer-events-none"
                                    initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    style={{ transformStyle: 'preserve-3d', translateZ: 50 }}
                                >
                                     <img 
                                        src="/images/user-portrait.png" 
                                        alt="Portrait" 
                                        className="object-contain object-bottom drop-shadow-2xl h-[90%] w-full"
                                     />
                                </motion.div>


                                </div>
                        </div>

                        {/* Left Side: Content (Relative) - Golden Ratio Large Part (~61.8%) */}
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

export default Iter5_Depth;
