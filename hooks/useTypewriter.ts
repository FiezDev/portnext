import { useEffect, useState } from 'react';

interface UseTypewriterOptions {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenWords?: number;
  loop?: boolean;
}

function useTypewriter({
  words = [],
  typingSpeed = 150,
  deletingSpeed = 100,
  delayBetweenWords = 2000,
  loop = true,
}: UseTypewriterOptions): string {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [wordIndex, setWordIndex] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (words.length === 0) return;

    const currentWord = words[wordIndex % words.length];
    let timeoutId: ReturnType<typeof setTimeout>;

    if (isDeleting) {
      timeoutId = setTimeout(() => {
        setDisplayedText((prev) => prev.slice(0, -1));
        if (displayedText === '') {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }, deletingSpeed);
    } else {
      timeoutId = setTimeout(() => {
        setDisplayedText(currentWord.substring(0, displayedText.length + 1));
        if (displayedText === currentWord) {
          if (loop || wordIndex < words.length - 1) {
            timeoutId = setTimeout(
              () => setIsDeleting(true),
              delayBetweenWords
            );
          }
        }
      }, typingSpeed);
    }

    return () => clearTimeout(timeoutId);
  }, [
    displayedText,
    isDeleting,
    wordIndex,
    words,
    typingSpeed,
    deletingSpeed,
    delayBetweenWords,
    loop,
  ]);

  return displayedText;
}

export default useTypewriter;
