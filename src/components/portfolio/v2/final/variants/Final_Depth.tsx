'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { GoldenContainer } from '../shared/GoldenLayout';
import { PageContent } from '../shared/PageContent';
import { generateRadialPackedWords } from '../shared/radialPacking';
import { PageId } from '../shared/useComplexTransition';

const MENU_ITEMS: PageId[] = ['Main', 'About', 'Skill', 'Projects', 'Contact'];

const Iter5_Depth = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('Main');

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
  // Stabilize word cloud generation - uses Radial Packing algorithm
  const wordCloudLayers = useMemo(() => {
     // 1. Generate a single master list of words so they don't overlap with each other
     const totalWords = 300;
     const allWords = generateRadialPackedWords(totalWords);
     
     // 2. Distribute words across layers
     const wordsPerLayer = Math.ceil(totalWords / layers.length);

     return layers.map((layer, index) => {
         // Slice the master list for this layer
         const layerWords = allWords.slice(index * wordsPerLayer, (index + 1) * wordsPerLayer);
         
         // For SVG viewbox 0 0 1000 1000, center is 500,500
         const VIRTUAL_CENTER_X = 500;
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
  }, []);

  return (
    <GoldenContainer className="bg-slate-900 perspective-[1000px] overflow-hidden">
        {/* Silhouette Visual Merge (Right Side) */}


        {/* Top Navigation */}
        <div className="absolute top-0 left-0 w-full p-8 flex justify-center z-50">
            <nav className="bg-white/10 backdrop-blur-md rounded-full px-8 py-4 border border-white/20">
                <ul className="flex gap-8">
                    {MENU_ITEMS.map((item) => (
                        <li key={item}>
                             <button
                                onClick={() => setCurrentPage(item)}
                                className={cn(
                                    "text-sm uppercase tracking-widest transition-all",
                                    currentPage === item ? "text-yellow-400 scale-110 font-bold" : "text-gray-400 hover:text-white"
                                )}
                             >
                                 {item}
                             </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>

        {/* 3D Scene Container */}
        <div className="w-full h-full relative flex items-center justify-center perspective-[2000px] overflow-hidden">
             <AnimatePresence mode="wait">
                <motion.div
                    key={currentPage}
                    className="w-[90%] md:w-[80%] h-[80%] bg-white shadow-2xl border-4 border-gray-100 flex items-center justify-center relative transform-style-3d"
                    variants={depthVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                     {/* Decorative Floating Elements */}
                     <motion.div 
                        className="absolute -top-10 -left-10 w-20 h-20 border-t-4 border-l-4 border-yellow-500"
                        animate={{ translateZ: 50 }}
                     />
                     <motion.div 
                        className="absolute -bottom-10 -right-10 w-20 h-20 border-b-4 border-r-4 border-yellow-500"
                        animate={{ translateZ: 50 }}
                     />
                                        {/* Unified Card Content */}
                    <div className="relative w-full h-full bg-white overflow-hidden">
                        
                        {/* Right Side: Silhouette Visual (Absolute) */}
                        <div className="absolute top-0 right-0 w-[50%] h-full z-10 pointer-events-none perspective-[1000px] hidden md:block">
                            <div className="relative w-full h-full flex items-center justify-center transform-style-3d">
                                {/* 1. Background Text Layers */}
                            <div className="relative w-full h-full flex items-center justify-center transform-style-3d">
                                {/* 1. Background Text Layers (Scattered Word Cloud) */}
                                {wordCloudLayers.map((layer, layerIndex) => (
                                    <motion.div
                                        key={layerIndex}
                                        className="absolute inset-0 overflow-hidden flex items-center justify-center"
                                        initial={{ translateZ: layer.z - 50, opacity: 0 }}
                                        animate={{ translateZ: layer.z - 50, opacity: 0.4 }}
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
                                            className="w-full h-full"
                                            style={{ overflow: 'visible' }}
                                        >
                                            {layer.items.map((item, itemIndex) => (
                                                <text
                                                    key={`${layerIndex}-${itemIndex}`}
                                                    x={item.x}
                                                    y={item.y}
                                                    fill="rgba(0,0,0,0.3)"
                                                    fontFamily="monospace"
                                                    fontWeight="bold"
                                                    fontSize={item.fontSize}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    transform={`rotate(${item.rotation}, ${item.x}, ${item.y})`}
                                                    className="select-none pointer-events-none"
                                                >
                                                    {item.text}
                                                </text>
                                            ))} 
                                        </svg>
                                    </motion.div>
                                ))}

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

                                {/* 3. Overlay Text */}
                                <div className="absolute top-12 left-8 z-30 pointer-events-none mix-blend-multiply">
                                    <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tacking-tighter leading-none">
                                        PASSION<br/>ATE
                                    </h1>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Left Side: Content (Relative) */}
                        <div className="h-full w-full md:w-[50%] overflow-y-auto relative z-20 bg-white/50 backdrop-blur-sm md:bg-transparent md:backdrop-filter-none">
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
