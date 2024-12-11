import { cn } from '@/lib/utils';

type ButtonProps = {
  text: string;
  className?: string;
};

const Button = ({ text = 'Default', className }: ButtonProps) => {
  return (
    <button
      className={cn(
        'w-full text-white bg-head border-0 py-2 px-6 focus:outline-none hover:bg-blue-600 rounded text-lg',
        className
      )}
    >
      {text}
    </button>
  );
};

export default Button;