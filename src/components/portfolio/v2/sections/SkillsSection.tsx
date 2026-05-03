'use client';

import { useRef } from 'react';
import GoldHeading from '../shared/GoldHeading';
import { useScrollyEntrance } from '../gsap/useScrollyEntrance';

const SkillsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  useScrollyEntrance(ref);

  return (
    <div
      ref={ref}
      className="flex flex-col justify-center h-full p-6 md:p-12 bg-transparent overflow-y-auto pointer-events-none"
    >
      <div data-stagger>
        <GoldHeading as="h2" className="text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-8">
          Core Skills
        </GoldHeading>
      </div>
      <p data-stagger className="text-sm text-gray-400 italic">
        Drag the orb to spin. Click any icon to learn more.
      </p>
    </div>
  );
};

export default SkillsSection;
