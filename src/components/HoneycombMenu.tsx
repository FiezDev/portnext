'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { type FC } from 'react';

interface HexagonItemProps {
  href: string;
  image: string;
  label: string;
  className?: string;
  imagePosition?: string;
}

const HexagonItem: FC<HexagonItemProps> = ({
  href,
  image,
  label,
  className,
  imagePosition,
}) => {
  return (
    <Link
      href={href}
      className={cn(
        'group relative hexagon-clip overflow-hidden',
        'w-[140px] h-40 sm:w-40 sm:h-[184px] md:w-48 md:h-56 lg:w-60 lg:h-64',
        'transition-all duration-300 ease-out',
        'hover:scale-110 hover:z-20',
        className
      )}
    >
      {/* Background Image */}
      <div className="absolute inset-0 hexagon-clip overflow-hidden">
        <Image
          src={image}
          alt={label}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          style={imagePosition ? { objectPosition: imagePosition } : undefined}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/30 to-bg/80 transition-opacity duration-300 group-hover:opacity-60" />
      </div>

      {/* Glass Effect Border */}
      <div className="absolute inset-0 hexagon-clip glass opacity-50 group-hover:opacity-80 transition-opacity duration-300" />

      {/* Label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold textglow drop-shadow-lg tracking-wider uppercase transition-all duration-300 group-hover:scale-110">
          {label}
        </span>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 hexagon-clip opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-normal/20 animate-pulse" />
      </div>
    </Link>
  );
};

interface MenuItem {
  href: string;
  image: string;
  label: string;
  imagePosition?: string;
}

interface HoneycombMenuProps {
  items: MenuItem[];
  className?: string;
}

const HoneycombMenu: FC<HoneycombMenuProps> = ({ items, className }) => {
  return (
    <div
      className={cn(
        'min-h-screen w-full flex items-center justify-center seembg pt-12 md:pt-14',
        className
      )}
    >
      <div className="honeycomb-container">
        {items.map((item, index) => (
          <HexagonItem
            key={item.href}
            href={item.href}
            image={item.image}
            label={item.label}
            imagePosition={item.imagePosition}
            className={cn('honeycomb-item', `honeycomb-item-${index}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default HoneycombMenu;
