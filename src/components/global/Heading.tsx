import { cn } from '@/src/utils/common';
interface HeadingProps {
  text: string;
  className?: string;
}

const Heading = ({ text = 'Default', className }: HeadingProps) => {
  return (
    <header
      className={cn(
        'textglow font-bold text-4xl xl:text-5xl text-white block uppercase tracking-wider',
        className
      )}
    >
      {text}
    </header>
  );
};

export default Heading;
