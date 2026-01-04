import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GoldenRatioProps {
  children: ReactNode;
  className?: string;
}

// A container that enforces a max-width based on golden ratio preferences or aspect ratio
// Outer wrapper: Full viewport width for background/side areas
// Inner container: Max-width 1366px, centered
export const GoldenContainer = ({ children, className }: GoldenRatioProps) => {
  return (
    <div className={cn("w-full h-screen flex items-center justify-center", className)}>
      <div 
        className="relative w-full h-full bg-white overflow-hidden"
        style={{ maxWidth: 'var(--max-content-width, 1366px)' }}
      >
        {children}
      </div>
    </div>
  );
};

// A splitter that divides space into A (1) and B (0.618)
// 1.618 total width -> ~61.8% and ~38.2%
export const GoldenSplit = ({ left, right, className }: { left: ReactNode; right: ReactNode; className?: string }) => {
  return (
    <div className={cn("flex w-full h-full", className)}>
      <div className="w-[61.8%] h-full overflow-hidden relative">
        {left}
      </div>
      <div className="w-[38.2%] h-full overflow-hidden relative border-l border-gray-100">
        {right}
      </div>
    </div>
  );
};

// Recursive spiral container helper (visual only for now)
export const GoldenSpiralGrid = () => {
    return (
        <div className="absolute inset-0 pointer-events-none opacity-10 z-0">
            <div className="w-full h-full border border-black relative">
                {/* Visual approximation of the spiral/golden rectangles */}
                <div className="absolute right-0 top-0 w-[38.2%] h-full border-l border-black">
                     <div className="absolute bottom-0 w-full h-[38.2%] border-t border-black">
                         <div className="absolute left-0 w-[38.2%] h-full border-r border-black">
                             {/* ... and so on */}
                         </div>
                     </div>
                </div>
            </div>
        </div>
    )
}
