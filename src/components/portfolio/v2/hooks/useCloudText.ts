import { useEffect, useState } from 'react';
import { generateRadialPackedWords } from '../shared/radialPacking';

interface CloudTextItem {
  text: string;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  fontSize: number;
  isHighlighted: boolean;
  highlightColor: string; // The color to glow when highlighted
  shouldGlow: boolean;    // Whether to do the silver breathing effect (if not highlighted)
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
  color: string;      // Highlight color (e.g. #FBBF24)
  colorFlag: boolean; // Enable highlight loop?
  glowFlag: boolean;  // Enable silver breathing?
  sortingType?: number;
}

export const useCloudText = ({
  position,
  color,
  colorFlag,
  glowFlag,
  sortingType = 1,
}: UseCloudTextProps) => {

  // Silhouette Layers Config
  const layersConfig = [
      { scale: 1.5, blur: 'blur(0px)', opacity: 0.1, z: -100 },
      { scale: 1.2, blur: 'blur(0px)', opacity: 0.4, z: -50 },
      { scale: 1.0, blur: 'blur(0px)', opacity: 1.0, z: 0 },
      { scale: 0.9, blur: 'blur(1px)', opacity: 0.6, z: 50 },
  ];

  const [layers, setLayers] = useState<CloudLayerData[]>([]);
  const [highlightedIndices, setHighlightedIndices] = useState<Array<{l: number, i: number}>>([]);

  // 1. Generate Words
  useEffect(() => {
     const totalWords = 150;
     const allWords = generateRadialPackedWords(totalWords, sortingType);
     
     const wordsPerLayer = Math.ceil(totalWords / layersConfig.length);

     const generatedLayers = layersConfig.map((config, index) => {
         const layerWords = allWords.slice(index * wordsPerLayer, (index + 1) * wordsPerLayer);
         
         const items = layerWords.map(w => ({
             text: w.text,
             x: position.x + w.x,
             y: position.y + w.y,
             rotation: w.rotation,
             fontSize: 36,
             // Base state, will be enriched during render/return with dynamic state
             isHighlighted: false, 
             highlightColor: color,
             shouldGlow: glowFlag
         }));

         return {
             ...config,
             items
         };
     });

     setLayers(generatedLayers);
  }, [position.x, position.y, sortingType]); // Re-generate if position or sorting changes

  // 2. Highlight Loop
  useEffect(() => {
     if (!colorFlag || layers.length === 0) {
         setHighlightedIndices([]);
         return;
     }
     
     const interval = setInterval(() => {
         // Pick 5 random words
         const candidates:Array<{l: number, i: number}> = [];
         for (let k = 0; k < 5; k++) {
            const randomLayerIndex = Math.floor(Math.random() * layers.length);
            const layer = layers[randomLayerIndex];
            if (layer && layer.items.length > 0) {
                const randomItemIndex = Math.floor(Math.random() * layer.items.length);
                candidates.push({ l: randomLayerIndex, i: randomItemIndex });
            }
         }
         
         setHighlightedIndices(candidates);

         // Clear after 3.5s
         setTimeout(() => {
              setHighlightedIndices([]);
         }, 3500);

      }, 5000);

     return () => clearInterval(interval);
  }, [layers.length, colorFlag]); // Re-run if layers populated or flag changes

  // 3. Merge State and Return
  // We return the layers with 'isHighlighted' computed
  const combinedLayers = layers.map((layer, lIndex) => ({
      ...layer,
      items: layer.items.map((item, iIndex) => ({
          ...item,
          isHighlighted: highlightedIndices.some(h => h.l === lIndex && h.i === iIndex),
          highlightColor: color,
          shouldGlow: glowFlag
      }))
  }));

  return { layers: combinedLayers };
};
