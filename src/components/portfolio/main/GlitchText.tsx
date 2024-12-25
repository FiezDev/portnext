'use client';

import { useGlitchText, UseGlitchTextProps } from '@/hooks/useGlitchText';
import { cn } from '@/lib/utils';

const GlitchText = ({
  texts,
  afterRandom,
  randomToFinishDuration,
  className,
}: UseGlitchTextProps) => {
  const { displayText, glitching } = useGlitchText({
    texts,
    afterRandom,
    randomToFinishDuration,
    className,
  });

  return (
    <span className={cn('transition-all text-light textglow', className)}>
      {displayText}
    </span>
  );
};

export default GlitchText;
