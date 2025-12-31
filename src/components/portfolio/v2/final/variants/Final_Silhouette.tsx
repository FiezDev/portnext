'use client';

import { motion } from 'framer-motion';
import { GoldenContainer } from '../shared/GoldenLayout';
import { getMottoString } from '../shared/motto';

const Iter3_Silhouette = () => {
  // Simulate 3D arrangement by layering text with different Z-indexes and blurs
  const layers = [
      { scale: 1.5, blur: 'blur(4px)', opacity: 0.2, z: -100 },
      { scale: 1.2, blur: 'blur(2px)', opacity: 0.5, z: -50 },
      { scale: 1.0, blur: 'blur(0px)', opacity: 1.0, z: 0 },
      { scale: 0.8, blur: 'blur(2px)', opacity: 0.5, z: 50 },
  ];

  return (
    <GoldenContainer className="bg-white overflow-hidden perspective-[1000px]">
        <div className="relative w-full h-full flex items-center justify-center transform-style-3d">
             {layers.map((layer, i) => (
                 <motion.div
                    key={i}
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ translateZ: layer.z, opacity: 0 }}
                    animate={{ translateZ: layer.z + 20, opacity: layer.opacity }}
                    transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        repeatType: "mirror",
                        delay: i * 0.5 
                    }}
                    style={{ 
                        filter: layer.blur,
                        zIndex: i
                    }}
                 >
                     <div 
                        className="w-[60%] h-[80%] bg-black text-white text-[8px] md:text-[10px] leading-tight font-mono overflow-hidden whitespace-pre-wrap break-all text-center p-4 rounded-full"
                        style={{
                            maskImage: 'url(/images/user-portrait.png)',
                            maskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            WebkitMaskImage: 'url(/images/user-portrait.png)',
                            WebkitMaskSize: 'contain',
                            WebkitMaskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center'
                        }}
                     >
                         {getMottoString(200)}
                     </div>
                 </motion.div>
             ))}

            <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none mix-blend-difference">
                 <h1 className="text-8xl md:text-[10rem] font-black text-white tacking-tighter">
                     PASSION
                 </h1>
            </div>
        </div>
    </GoldenContainer>
  );
};

export default Iter3_Silhouette;
