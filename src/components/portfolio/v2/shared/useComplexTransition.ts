import { Variants } from 'framer-motion';

export type PageId = 'Main' | 'About' | 'Skill' | 'Projects' | 'Contact';

// Define transition types
type TransitionType = 'slide' | 'fade' | 'scale' | 'wipe' | 'flip';

// Matrix of transitions [From][To]
// We can define specific pairs here. 
// For simplification in this hook, we'll return variants based on the direction or pair.

const transitions: Record<string, Record<string, TransitionType>> = {
  Main: {
    About: 'slide',
    Skill: 'scale',
    Projects: 'wipe',
    Contact: 'flip',
  },
  About: {
    Main: 'slide',
    Skill: 'fade',
    Projects: 'scale',
    Contact: 'wipe',
  },
  // Default fallbacks can be handled in logic
};

export const useComplexTransition = (from: PageId, to: PageId) => {
  // Determine transition type based on pair
  const type = transitions[from]?.[to] || 'fade';
  
  // Return framer motion variants based on type
  const getVariants = (): Variants => {
    switch (type) {
      case 'slide':
        return {
          initial: { x: '100%', opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: '-100%', opacity: 0 },
        };
      case 'scale':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 1.2, opacity: 0 },
        };
      case 'wipe':
        return {
          initial: { clipPath: 'circle(0% at 50% 50%)' },
          animate: { clipPath: 'circle(150% at 50% 50%)' },
          exit: { clipPath: 'circle(0% at 50% 50%)' },
        };
      case 'flip':
        return {
            initial: { rotateY: 90, opacity: 0 },
            animate: { rotateY: 0, opacity: 1 },
            exit: { rotateY: -90, opacity: 0 },
        }
      case 'fade':
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  return { variants: getVariants(), transition: { duration: 0.5, ease: 'easeInOut' as const } };
};
