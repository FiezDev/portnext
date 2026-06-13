import { useEffect, useState, useMemo, useRef } from 'react';
import { generateRadialPackedWords } from '../shared/radialPacking';
import { RELATED_WORDS } from '../shared/motto';
import { mulberry32, pickGameWords, scatterWords } from '../game/heroGameLogic';

interface CloudTextItem {
  text: string;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  fontSize: number;
  isHighlighted: boolean;
  highlightColor: string;
  shouldGlow: boolean;
  // Precomputed once at generation so re-renders (e.g. game timer ticks) don't
  // reassign random timings and restart every word's animation.
  animDuration: number;
  animDelay: number;
}

interface CloudLayerData {
  z: number;
  blur: string;
  opacity: number;
  scale: number;
  items: CloudTextItem[];
}

interface UseCloudTextProps {
  position: { x: number; y: number };
  color: string;
  colorFlag: boolean;
  glowFlag: boolean;
  sortingType?: number;
  /** Word count: decorative default 80; the game uses a sparse ~20. */
  count?: number;
  /** Seed for the game's deterministic sparse re-randomize. */
  seed?: number;
  /** Game mode: sparse + centered + clickable; disables the decorative flicker. */
  gameActive?: boolean;
  /** Portrait/narrow viewport: lay the game board out taller + larger for touch. */
  portrait?: boolean;
}

// Reduced layers for better performance
const LAYERS_CONFIG = [
  { scale: 1.2, blur: 'blur(0px)', opacity: 0.4, z: -50 },
  { scale: 1.0, blur: 'blur(0px)', opacity: 1.0, z: 0 },
];

export const useCloudText = ({
  position,
  color,
  colorFlag,
  glowFlag,
  sortingType = 1,
  count = 80,
  seed = 1,
  gameActive = false,
  portrait = false,
}: UseCloudTextProps) => {

  const [layers, setLayers] = useState<CloudLayerData[]>([]);
  const highlightedIndices = useRef<Array<{l: number, i: number}>>([]);
  const [, forceUpdate] = useState(0);

  // Generate Words - only when colorFlag is true (on Main page)
  useEffect(() => {
     if (!colorFlag) {
       setLayers([]);
       return;
     }

     // GAME MODE: one sparse, centered, deterministic layer (the game board).
     if (gameActive) {
       const rng = mulberry32(seed);
       const words = pickGameWords(RELATED_WORDS, count, rng);
       // Portrait viewBox is 560x1000 (taller, larger words for touch);
       // landscape is the square 1000x1000.
       const layout = portrait
         ? { centerX: 280, centerY: 500, regionWidth: 500, regionHeight: 900, fontSize: 40 }
         : { centerX: 500, centerY: 500, regionWidth: 880, regionHeight: 760, fontSize: 30 };
       const scattered = scatterWords(words, rng, layout);
       const items = scattered.map(w => ({
         text: w.text,
         x: w.x,
         y: w.y,
         rotation: w.rotation,
         fontSize: w.fontSize,
         isHighlighted: false,
         highlightColor: color,
         shouldGlow: glowFlag,
         animDuration: 3 + Math.random() * 2,
         animDelay: Math.random() * 2,
       }));
       setLayers([{ scale: 1.0, blur: 'blur(0px)', opacity: 1.0, z: 0, items }]);
       return;
     }

     // DECORATIVE MODE: original multi-layer radial cloud.
     const totalWords = count;
     const allWords = generateRadialPackedWords(totalWords, sortingType);
     const wordsPerLayer = Math.ceil(totalWords / LAYERS_CONFIG.length);

     const generatedLayers = LAYERS_CONFIG.map((config, index) => {
         const layerWords = allWords.slice(index * wordsPerLayer, (index + 1) * wordsPerLayer);

         const items = layerWords.map(w => ({
             text: w.text,
             x: position.x + w.x,
             y: position.y + w.y,
             rotation: w.rotation,
             fontSize: 36,
             isHighlighted: false,
             highlightColor: color,
             shouldGlow: glowFlag,
             animDuration: 3 + Math.random() * 2,
             animDelay: Math.random() * 2,
         }));

         return { ...config, items };
     });

     setLayers(generatedLayers);
  }, [position.x, position.y, sortingType, colorFlag, color, glowFlag, count, seed, gameActive, portrait]);

  // Highlight Loop - only when colorFlag is true and NOT in game mode
  useEffect(() => {
     if (!colorFlag || layers.length === 0 || gameActive) return;

     const interval = setInterval(() => {
         const candidates:Array<{l: number, i: number}> = [];
         for (let k = 0; k < 3; k++) { // Reduced from 5 to 3
            const randomLayerIndex = Math.floor(Math.random() * layers.length);
            const layer = layers[randomLayerIndex];
            if (layer && layer.items.length > 0) {
                const randomItemIndex = Math.floor(Math.random() * layer.items.length);
                candidates.push({ l: randomLayerIndex, i: randomItemIndex });
            }
         }

         highlightedIndices.current = candidates;
         forceUpdate(n => n + 1);

         setTimeout(() => {
              highlightedIndices.current = [];
              forceUpdate(n => n + 1);
         }, 3500);

      }, 5000);

     return () => clearInterval(interval);
  }, [layers, colorFlag, gameActive]);

  // Merge State and Return - using ref for better performance
  const combinedLayers = useMemo(() => {
    if (layers.length === 0) return [];
    const currentHighlighted = highlightedIndices.current;

    return layers.map((layer, lIndex) => ({
        ...layer,
        items: layer.items.map((item, iIndex) => ({
            ...item,
            isHighlighted: currentHighlighted.some(h => h.l === lIndex && h.i === iIndex),
            highlightColor: color,
            shouldGlow: glowFlag
        }))
    }));
  }, [layers, color, glowFlag]);

  return { layers: combinedLayers };
};
