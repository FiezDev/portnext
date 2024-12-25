'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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

      const revealedIndices = new Set<number>();
      const initialText = Array.from(text)
        .map(() => getRandomChar())
        .join('');

      indices.forEach((index, step) => {
        const timeout = setTimeout(() => {
          revealedIndices.add(index);
          const updatedText = glitchifyTextContinuously(
            initialText,
            text,
            revealedIndices
          );
          setDisplayText(updatedText);
        }, step * stepDuration);

        timeoutsRef.current.push(timeout);
      });

      const finalTimeout = setTimeout(() => setDisplayText(text), duration);
      timeoutsRef.current.push(finalTimeout);
    },
    [getRandomChar, glitchifyTextContinuously]
  );

  useEffect(() => {
    const glitchCycle = () => {
      setGlitching(true);
      const initialText = texts[currentIndex];
      setDisplayText(
        glitchifyTextContinuously(initialText, initialText, new Set())
      );

      const glitchTimeout = setTimeout(() => {
        setGlitching(false);
        revealTextRandom(initialText, randomToFinishDuration);

        const revealTimeout = setTimeout(() => {
          const intervalTimeout = setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
          }, afterRandom);
          timeoutsRef.current.push(intervalTimeout);
        }, randomToFinishDuration);
        timeoutsRef.current.push(revealTimeout);
      }, delayBeforeChangeText);
      timeoutsRef.current.push(glitchTimeout);
    };

    glitchCycle();

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
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
