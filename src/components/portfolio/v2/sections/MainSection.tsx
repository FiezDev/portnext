'use client';

import { motion } from 'framer-motion';
import GoldHeading from '../shared/GoldHeading';
import { useGlitchText } from '@/hooks/useGlitchText';

const JOB_TITLES = [
  'Fullstack Developer',
  'Frontend Developer',
  'Web Developer',
  'React Developer',
  'TypeScript Developer',
];

const QUOTE_TEXT = 'Passionate to make the remarkable thing';

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

const MainSection = () => {
  const { displayText, glitching } = useGlitchText({
    texts: JOB_TITLES,
    afterRandom: 3000,
    delayBeforeChangeText: 100,
    randomToFinishDuration: 800,
  });

  return (
    <motion.div
      className="flex flex-col justify-center h-full p-6 md:p-12"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* PORTFOLIO Heading */}
      <motion.div variants={itemVariants}>
        <GoldHeading
          as="h1"
          className="text-5xl md:text-7xl lg:text-8xl mb-4 leading-none"
        >
          PORT
          <br />
          FOLIO
        </GoldHeading>
      </motion.div>

      {/* GlitchText Job Title */}
      <motion.div
        variants={itemVariants}
        className="mb-6"
      >
        <p className="text-lg md:text-2xl text-gray-700 font-light">
          I&apos;m a{' '}
          <span
            className={`font-mono font-bold text-gray-900 ${
              glitching ? 'text-yellow-600' : ''
            } transition-colors duration-150`}
          >
            {displayText}
          </span>
        </p>
      </motion.div>

      {/* Quote with breathing glow effect */}
      <motion.div
        variants={itemVariants}
        className="relative"
      >
        <motion.p
          className="text-sm md:text-base italic text-gray-500 max-w-md"
          animate={{
            textShadow: [
              '0 0 0px rgba(251, 191, 36, 0)',
              '0 0 20px rgba(251, 191, 36, 0.5)',
              '0 0 0px rgba(251, 191, 36, 0)',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          &ldquo;{QUOTE_TEXT}&rdquo;
        </motion.p>
      </motion.div>

      {/* Subtle scroll hint */}
      <motion.div
        variants={itemVariants}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1.5 h-2.5 bg-gray-400 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default MainSection;
