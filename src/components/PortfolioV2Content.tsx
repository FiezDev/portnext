'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { PageId } from './portfolio/v2/final/shared/useComplexTransition';
import Final_Depth from './portfolio/v2/final/variants/Final_Depth';

const PAGE_ITEMS: PageId[] = ['About', 'Skill', 'Projects', 'Contact'];

const PortfolioV2Content = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('About');

  return (
    <div className="relative w-full min-h-screen bg-white overflow-hidden font-sans flex justify-center">
      
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
        <Final_Depth currentPage={currentPage} />
      </div>

      {/* Fixed Bottom Navigation Menu - Stays centered relative to viewport */}
      <div className="fixed bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 z-[100] flex gap-2 p-2 bg-black/80 backdrop-blur-md rounded-full border border-white/10 shadow-2xl">
        <div className="flex bg-white/5 rounded-full p-1 border border-white/5">
            {PAGE_ITEMS.map((page) => (
            <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'relative px-4 md:px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300',
                  currentPage === page
                    ? 'text-yellow-950'
                    : 'text-gray-400 hover:text-white'
                )}
            >
                {currentPage === page && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-yellow-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
                )}
                <span className="relative z-10">{page}</span>
            </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioV2Content;
