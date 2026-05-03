'use client';

import { forwardRef, useEffect, useState } from 'react';
import type { Group } from 'three';
import WordGalaxy from '../primitives/WordGalaxy';

const TOTAL = 50;
const HIGHLIGHT_COUNT = 3;

const pickRandom = (n: number, total: number) => {
  const set = new Set<number>();
  while (set.size < Math.min(n, total)) set.add(Math.floor(Math.random() * total));
  return set;
};

const MainScene = forwardRef<Group, { visible: boolean }>(({ visible }, ref) => {
  const [highlights, setHighlights] = useState<Set<number>>(() => pickRandom(HIGHLIGHT_COUNT, TOTAL));

  useEffect(() => {
    if (!visible) return;
    const id = window.setInterval(() => {
      setHighlights(pickRandom(HIGHLIGHT_COUNT, TOTAL));
    }, 4000);
    return () => window.clearInterval(id);
  }, [visible]);

  return (
    <group ref={ref} visible={visible}>
      <WordGalaxy visible={visible} count={TOTAL} highlightedIndices={highlights} />
    </group>
  );
});
MainScene.displayName = 'MainScene';
export default MainScene;
