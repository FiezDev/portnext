import { cn } from '@/lib/utils';
import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GoldHeadingProps extends MotionProps {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div';
}

const GoldHeading = ({ children, className, as = 'h2', ...props }: GoldHeadingProps) => {
  const Component = motion[as];
  
  return (
    <Component
      className={cn(
        "font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export default GoldHeading;
