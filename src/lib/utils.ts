import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const resolveImageSrc = (path: string): string => {
  if (!path) return '';
  if (/^https?:\/\//.test(path) || path.startsWith('/')) return path;
  return `${process.env.NEXT_PUBLIC_IMGIX_URL || ''}${path}`;
};
