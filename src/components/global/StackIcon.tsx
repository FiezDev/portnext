import { cn } from '@/lib/utils';
import type { IconType } from 'react-icons';

interface StackIconProps {
  url: string;
  Icon?: IconType;
  img?: string;
  color: string;
  name: string;
  className?: string;
}

const StackIcon = ({ url, Icon, img, color, name, className }: StackIconProps) => {
  return (
    <a
      className={cn(
        'group basis-1/4 md:basis-[14%] flex items-center justify-around pb-4 relative',
        className
      )}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="relative group-hover:rotate-3 transform transition-transform duration-300 ease-in-out hover:duration-1000">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={name} width={48} height={48} className="object-contain" />
        ) : (
          Icon && <Icon size={48} color={color} />
        )}
      </div>
      <span className="absolute left-1/2 bottom-0 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition duration-300 text-white z-10 whitespace-nowrap">
        {name}
      </span>
    </a>
  );
};

export default StackIcon;
