import { cn } from '@/lib/utils'; // Assuming cn utility exists, otherwise will adjust
import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

const Section = ({ children, className, id }: SectionProps) => {
  return (
    <section 
      id={id}
      className={cn(
        "min-h-screen w-full bg-white text-gray-900 px-6 py-12 md:px-12 md:py-20 overflow-hidden relative",
        className
      )}
    >
      <div className="max-w-7xl mx-auto relative z-10 h-full flex flex-col justify-center">
        {children}
      </div>
    </section>
  );
};

export default Section;
