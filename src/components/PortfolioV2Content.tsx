'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Final_Depth from './portfolio/v2/final/variants/Final_Depth';
import Final_Silhouette from './portfolio/v2/final/variants/Final_Silhouette';

const VARIANTS = [
  { id: 'about', name: 'About', component: Final_Depth },
  { id: 'silhouette', name: 'Silhouette', component: Final_Silhouette },
];

const PortfolioV2Content = () => {
  const [activeVariantId, setActiveVariantId] = useState<string>('about');

  const ActiveComponent = VARIANTS.find((v) => v.id === activeVariantId)?.component || Final_Depth;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      {/* Variant Content */}
      <div className="w-full h-full">
        <ActiveComponent />
      </div>

      {/* Floating Variant Switcher */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[100] flex gap-2 p-2 bg-black/80 backdrop-blur-md rounded-full border border-white/10 shadow-2xl">
        <div className="flex bg-white/5 rounded-full p-1 border border-white/5">
            {VARIANTS.map((variant) => (
            <button
                key={variant.id}
                onClick={() => setActiveVariantId(variant.id)}
                className={cn(
                  'relative px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300',
                  activeVariantId === variant.id
                    ? 'text-black'
                    : 'text-gray-400 hover:text-white'
                )}
            >
                {activeVariantId === variant.id && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
                )}
                <span className="relative z-10">{variant.name}</span>
            </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioV2Content;
