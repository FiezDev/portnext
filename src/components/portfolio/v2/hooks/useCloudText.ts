import { useEffect, useState, useMemo, useRef } from 'react';
import { generateRadialPackedWords } from '../shared/radialPacking';

interface CloudTextItem {
  text: string;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  fontSize: number;
  isHighlighted: boolean;
  highlightColor: string;
  shouldGlow: boolean;
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

     // Reduced words for better performance (80 instead of 150)
     const totalWords = 80;
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
             shouldGlow: glowFlag
         }));

         return { ...config, items };
     });

     setLayers(generatedLayers);
  }, [position.x, position.y, sortingType, colorFlag, color, glowFlag]);

  // Highlight Loop - only when colorFlag is true
  useEffect(() => {
     if (!colorFlag || layers.length === 0) return;

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
  }, [layers, colorFlag]);

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
