'use client';

import { motion } from 'framer-motion';
import GoldHeading from '../shared/GoldHeading';
import { coreicon } from '@/constants/mapdata';
import Image from 'next/image';
import { useState } from 'react';

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, scale: 0.8, rotate: -10 },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

const SkillsSection = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <motion.div
      className="flex flex-col justify-center h-full p-6 md:p-12 bg-transparent overflow-y-auto"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={itemVariants}>
        <GoldHeading as="h2" className="text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-8">
          Core Skills
        </GoldHeading>
      </motion.div>

      {/* Responsive Grid */}
      <motion.div
        className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 md:gap-6"
        variants={containerVariants}
      >
        {coreicon.map((skill, index) => (
          <motion.a
            key={skill.id}
            href={skill.url}
            target="_blank"
            rel="noopener noreferrer"
            variants={itemVariants}
            custom={index}
            onMouseEnter={() => setHoveredId(skill.id)}
            onMouseLeave={() => setHoveredId(null)}
            whileHover={{
              scale: 1.15,
              rotate: 5,
              zIndex: 10,
            }}
            whileTap={{ scale: 0.95 }}
            className="relative group flex flex-col items-center justify-center p-3 md:p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-100 hover:border-yellow-300 hover:bg-yellow-50/50 transition-all duration-300 cursor-pointer"
          >
            {/* Glow effect on hover */}
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-200/20 to-amber-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={false}
            />

            {/* Icon */}
            <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
              <Image
                src={skill.icon}
                alt={skill.tooltipText}
                width={skill.width}
                height={skill.height}
                className="object-contain transition-all duration-300"
              />
            </div>

            {/* Tooltip */}
            <motion.span
              initial={{ opacity: 0, y: 5 }}
              animate={{
                opacity: hoveredId === skill.id ? 1 : 0,
                y: hoveredId === skill.id ? 0 : 5,
              }}
              transition={{ duration: 0.2 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-20 pointer-events-none"
            >
              {skill.tooltipText}
              {/* Tooltip arrow */}
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900" />
            </motion.span>
          </motion.a>
        ))}
      </motion.div>

      {/* Subtitle */}
      <motion.p
        variants={itemVariants}
        className="mt-6 md:mt-8 text-sm text-gray-400 italic"
      >
        Click any icon to learn more about the technology
      </motion.p>
    </motion.div>
  );
};

export default SkillsSection;
