'use client';

import '@/styles/globals.css';

interface FallbackProps {
  text?: string;
}

const Fallback = ({ text = 'Loading...' }: FallbackProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-120 pt-16 md:pt-24 bg-black">
      <p className="flex space-x-1 text-4xl font-bold">
        {text.split('').map((char, index) => (
          <span
            key={index}
            className="text-blue-500 text-shadow animate-neonFlash"
            style={{ animationDelay: `${index * 0.3}s` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </p>
    </div>
  );
};

export default Fallback;
