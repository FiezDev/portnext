'use client';

import { useCallback, useEffect, useState } from 'react';

export interface UseGlitchTextProps {
  texts: string[];
  afterRandom?: number;
  delayBeforeChangeText?: number;
  randomToFinishDuration?: number;
  className?: string;
}

const glitchChars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

const shuffleArray = (array: number[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const useGlitchText = ({
  texts,
  afterRandom = 3000,
  delayBeforeChangeText = 0,
  randomToFinishDuration = 2000,
}: UseGlitchTextProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [glitching, setGlitching] = useState(false);

  const getRandomChar = useCallback(() => {
    return glitchChars[Math.floor(Math.random() * glitchChars.length)];
  }, []);

  const glitchifyTextContinuously = useCallback(
    (
      currentText: string,
      correctText: string,
      revealedIndices: Set<number>
    ) => {
      return currentText
        .split('')
        .map((char, index) =>
          revealedIndices.has(index) ? correctText[index] : getRandomChar()
        )
        .join('');
    },
    [getRandomChar]
  );

  const revealTextRandom = useCallback(
    (text: string, duration: number) => {
      const textLength = text.length;
      const indices = shuffleArray(
        Array.from({ length: textLength }, (_, i) => i)
      );
      const stepDuration = duration / textLength;

      let currentText = Array.from(text)
        .map(() => getRandomChar())
        .join('');
      let revealedIndices = new Set<number>();

      indices.forEach((index, step) => {
        setTimeout(() => {
          revealedIndices.add(index); // Add this index to revealed characters
          currentText = glitchifyTextContinuously(
            currentText,
            text,
            revealedIndices
          );
          setDisplayText(currentText);
        }, step * stepDuration);
      });

      // Ensure the text is fully correct at the end
      setTimeout(() => setDisplayText(text), duration);
    },
    [getRandomChar, glitchifyTextContinuously]
  );

  useEffect(() => {
    let glitchTimeout: NodeJS.Timeout;
    let revealTimeout: NodeJS.Timeout;
    let intervalTimeout: NodeJS.Timeout;

    const glitchCycle = () => {
      setGlitching(true);
      const initialText = texts[currentIndex];
      setDisplayText(
        glitchifyTextContinuously(initialText, initialText, new Set())
      );

      glitchTimeout = setTimeout(() => {
        setGlitching(false);
        revealTextRandom(initialText, randomToFinishDuration);

        revealTimeout = setTimeout(() => {
          intervalTimeout = setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
          }, afterRandom);
        }, randomToFinishDuration);
      }, delayBeforeChangeText);
    };

    glitchCycle();

    return () => {
      clearTimeout(glitchTimeout);
      clearTimeout(revealTimeout);
      clearTimeout(intervalTimeout);
    };
  }, [
    texts,
    currentIndex,
    glitchifyTextContinuously,
    revealTextRandom,
    delayBeforeChangeText,
    randomToFinishDuration,
    afterRandom,
  ]);

  return { displayText, glitching };
};
