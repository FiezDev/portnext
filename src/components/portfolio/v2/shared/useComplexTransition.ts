import { Variants, Transition } from 'framer-motion';

export type PageId = 'Main' | 'About' | 'Skill' | 'Projects' | 'Contact';

// Page order for direction-aware transitions
export const PAGE_ORDER: PageId[] = ['Main', 'About', 'Skill', 'Projects', 'Contact'];

// Define transition types
type TransitionType = 'slideLeft' | 'slideRight' | 'scale' | 'wipe' | 'flip' | 'fade';

// Direction for slide transitions
type SlideDirection = 'left' | 'right';

interface TransitionConfig {
  variants: Variants;
  transition: Transition;
  containerVariants?: Variants;
  itemVariants?: Variants;
}

// Get slide direction based on page navigation
const getSlideDirection = (from: PageId, to: PageId): SlideDirection => {
  const fromIndex = PAGE_ORDER.indexOf(from);
  const toIndex = PAGE_ORDER.indexOf(to);

  // Forward navigation: slide from right (content enters from right, exits to left)
  // Backward navigation: slide from left (content enters from left, exits to right)
  return toIndex > fromIndex ? 'right' : 'left';
};

// Determine if we're jumping (non-adjacent pages)
const isJump = (from: PageId, to: PageId): boolean => {
  const fromIndex = PAGE_ORDER.indexOf(from);
  const toIndex = PAGE_ORDER.indexOf(to);
  return Math.abs(toIndex - fromIndex) > 1;
};

// Get transition type based on navigation pattern
const getTransitionType = (from: PageId, to: PageId): TransitionType => {
  if (isJump(from, to)) {
    return 'flip'; // Use flip for jumps
  }
  return 'slideLeft'; // Use slide for adjacent pages (direction handled in variants)
};

// Container variants for staggered children animations
const containerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

// Item variants for staggered content
const itemVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 }
  }
};

export const useComplexTransition = (from: PageId, to: PageId): TransitionConfig => {
  const type = getTransitionType(from, to);
  const direction = getSlideDirection(from, to);

  // Base transition duration
  const baseTransition: Transition = { duration: 0.5, ease: 'easeInOut' };

  const getVariants = (): Variants => {
    switch (type) {
      case 'slideLeft':
        // Direction-aware slide
        if (direction === 'right') {
          // Going forward: new content enters from right
          return {
            initial: { x: 100, opacity: 0, scale: 0.98 },
            animate: { x: 0, opacity: 1, scale: 1 },
            exit: { x: -100, opacity: 0, scale: 0.98 },
          };
        } else {
          // Going backward: new content enters from left
          return {
            initial: { x: -100, opacity: 0, scale: 0.98 },
            animate: { x: 0, opacity: 1, scale: 1 },
            exit: { x: 100, opacity: 0, scale: 0.98 },
          };
        }
      case 'scale':
        return {
          initial: { scale: 0.9, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 1.05, opacity: 0 },
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
        };
      case 'fade':
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  return {
    variants: getVariants(),
    transition: baseTransition,
    containerVariants,
    itemVariants,
  };
};

// Export helper to check if a page exists
export const isValidPage = (page: string): page is PageId => {
  return PAGE_ORDER.includes(page as PageId);
};

// Get next/previous page
export const getAdjacentPage = (currentPage: PageId, direction: 'next' | 'prev'): PageId | null => {
  const currentIndex = PAGE_ORDER.indexOf(currentPage);
  if (currentIndex === -1) return null;

  const nextIndex = direction === 'next'
    ? Math.min(currentIndex + 1, PAGE_ORDER.length - 1)
    : Math.max(currentIndex - 1, 0);

  return PAGE_ORDER[nextIndex];
};
