'use client';

import useTypewriter from '@/hooks/useTypewriter';

const Typewriter = () => {
  const words = ['Fullstack Developer', 'Frontend Developer', 'Web Developer'];
  const displayedText = useTypewriter({
    words,
    typingSpeed: 150,
    deletingSpeed: 100,
    delayBetweenWords: 2000,
    loop: true,
  });

  return (
    <span className="py-1 xl:py-2 text-normalH">
      {displayedText}
      <span className="blinking-cursor">|</span>{' '}
    </span>
  );
};

export default Typewriter;
