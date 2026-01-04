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
      {/* Main Content - Max width 1366px, centered */}
      <div 
        className="w-full h-screen"
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
