'use client';

import { motion } from 'framer-motion';
import GoldHeading, { KICKER } from '../shared/GoldHeading';
import { MORPH_LAYOUT_TRANSITION } from '../shared/useMorphTransition';
import { coreicon } from '@/constants/mapdata';

// Editorial grouping — the icon data has no categories, so the section owns them.
const GROUPS: { label: string; names: string[] }[] = [
  { label: 'Languages', names: ['TypeScript', 'JavaScript', 'Python', 'HTML5', 'CSS3'] },
  { label: 'Frontend', names: ['React', 'Next.js', 'Tailwind CSS', 'Zustand'] },
  { label: 'Motion & 3D', names: ['Three.js', 'GSAP', 'Framer Motion'] },
  { label: 'Backend & Cloud', names: ['Node.js', 'Firebase', 'Vercel', 'Google Cloud', 'AWS'] },
];

const byName = new Map(coreicon.map((s) => [s.name, s]));

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.25 },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
};

// Chips ripple upward one after another while their group is hovered.
const chipWave = {
  wave: (i: number) => ({
    y: [0, -5, 0],
    transition: { duration: 0.35, delay: i * 0.035, ease: 'easeInOut' as const },
  }),
};

const SkillsSection = () => {
  return (
    <motion.div
      className="flex flex-col lg:flex-row lg:items-center justify-start lg:justify-center min-h-full gap-8 lg:gap-14 p-6 md:p-10 lg:p-14 pb-24 lg:pb-24 bg-transparent"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Left rail — golden minor column */}
      <motion.div
        variants={itemVariants}
        className="lg:w-[38.2%] shrink-0 flex flex-col gap-4 lg:gap-5"
      >
        <motion.p layoutId="page-kicker" transition={MORPH_LAYOUT_TRANSITION} className={KICKER}>
          02 · Capabilities
        </motion.p>
        <GoldHeading
          as="h2"
          layoutId="page-heading"
          transition={MORPH_LAYOUT_TRANSITION}
          className="text-5xl md:text-6xl lg:text-7xl leading-[0.95]"
        >
          Core
          <br />
          Skills
        </GoldHeading>
        <motion.div
          layoutId="page-rule"
          transition={MORPH_LAYOUT_TRANSITION}
          className="h-px w-16 bg-gradient-to-r from-amber-400 to-transparent"
        />
        <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-sm">
          <span className="font-semibold text-gray-700">
            Framework-agnostic engineer.
          </span>{' '}
          I ship production work across many frameworks and libraries, whichever
          fits the job. What's listed here is a glimpse, not the whole picture.
        </p>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
          {coreicon.length} technologies · {GROUPS.length} domains
        </p>
      </motion.div>

      {/* Right — grouped chip grid, names always visible */}
      <div className="lg:w-[61.8%] flex flex-col gap-6 lg:gap-8">
        {GROUPS.map((group, gi) => {
          const items = group.names
            .map((n) => byName.get(n))
            .filter((s): s is NonNullable<typeof s> => Boolean(s));
          return (
            <motion.div key={group.label} variants={itemVariants} whileHover="wave">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="font-mono text-xs text-amber-500">
                  0{gi + 1}
                </span>
                <h3 className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-gray-800">
                  {group.label}
                </h3>
                <span className="text-xs text-gray-500">{items.length}</span>
                <span className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
              </div>
              <div className="flex flex-wrap gap-2 md:gap-2.5">
                {items.map((skill, chipIndex) => {
                  const SkillIcon = skill.Icon;
                  return (
                    <motion.a
                      key={skill.name}
                      custom={chipIndex}
                      variants={chipWave}
                      href={skill.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`${skill.name} — documentation`}
                      className="group flex items-center gap-2.5 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm pl-3 pr-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:border-amber-400 hover:bg-amber-50/70 hover:text-gray-900 hover:shadow-md hover:shadow-amber-500/10"
                    >
                      <span className="flex h-5 w-5 items-center justify-center">
                        {skill.img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={skill.img}
                            alt=""
                            className="h-5 w-5 object-contain"
                          />
                        ) : (
                          SkillIcon && (
                            <SkillIcon size={18} style={{ color: skill.color }} />
                          )
                        )}
                      </span>
                      {skill.name}
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SkillsSection;
