import { cn } from '@/lib/utils';

interface HeadingProps {
  text: string;
  className?: string;
}

const Heading = ({ text = 'Default', className }: HeadingProps) => {
  return (
    <header
      className={cn(
        'textglow font-bold text-4xl xl:text-5xl text-lightH block uppercase tracking-wider',
        className
      )}
    >
      {text}
    </header>
  );
};

export default Heading;
