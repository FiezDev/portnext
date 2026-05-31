import { RELATED_WORDS } from './motto';

/**
 * Configuration
 */
const FONT_SIZE = 36; 
const CHAR_WIDTH_RATIO = 0.7; // Tighter ratio for true monospace density (SVG handles safety)
const GAP = 2;

export interface Rect {
  x: number; // center x
  y: number; // center y
  width: number;
  height: number;
  rotation: 0 | 90 | 180 | 270;
}

export interface PlacedWord extends Rect {
  text: string;
}

/**
 * Helper to get dimensions of a word based on fixed font size and rotation.
 */
function getWordDimensions(text: string, rotation: number) {
  // Base dimensions assuming 0 rotation
  const baseWidth = text.length * FONT_SIZE * CHAR_WIDTH_RATIO;
  const baseHeight = FONT_SIZE;

  if (rotation === 90 || rotation === 270) {
    return { width: baseHeight, height: baseWidth };
  }
  return { width: baseWidth, height: baseHeight };
}

/**
 * Check if two rects overlap, considering the GAP is PART of the placement 
 * but for overlap checking we strictly check if the actual bounding boxes intersect.
 * 
 * However, the user wants "Strict 15px gap". 
 * This usually means we pad the rects by GAP/2 when checking or maintain gap explicitly.
 * Simpler: Check if rects intersect. 
 * If they intersect, it's an overlap.
 */
function isOverlapping(pid: Rect, others: Rect[]) {
  // Shrink the gap slightly from comparison to allow "touching" at exactly GAP distance?
  // Actually, standard AABB intersection.
  // We want to ensure min distance >= GAP.
  // Equivalent to expanding one rect by GAP and checking intersection?
  for (const other of others) {
    // Check intersection with GAP buffer
    // Overlap condition:
    // deltaX < (w1 + w2)/2 + GAP
    // deltaY < (h1 + h2)/2 + GAP
    const dx = Math.abs(pid.x - other.x);
    const dy = Math.abs(pid.y - other.y);
    
    // We allow floating point error tolerance (epsilon)
    const minDx = (pid.width + other.width) / 2 + GAP - 0.1;
    const minDy = (pid.height + other.height) / 2 + GAP - 0.1;

    if (dx < minDx && dy < minDy) {
      return true;
    }
  }
  return false;
}

/**
 * Check connectivity: Does this rect "touch" (distance approx GAP) any other rect?
 * "Touch" means distance is exactly GAP (within epsilon) in one dimension, and overlaps in the other.
 */
function getConnectionCount(candidate: Rect, others: Rect[]) {
  let count = 0;
  for (const other of others) {
    const dx = Math.abs(candidate.x - other.x);
    const dy = Math.abs(candidate.y - other.y);
    
    const wSum = (candidate.width + other.width) / 2;
    const hSum = (candidate.height + other.height) / 2;
    
    // Check X-axis touch (gap in X, overlap in Y)
    // Distance X is roughly wSum + GAP
    const isXTouch = Math.abs(dx - (wSum + GAP)) < 1;
    const isYOverlap = dy < (hSum + GAP); // Strictly speaking, overlap in Y means dy < hSum? 
                                          // But usually "align" means they share some Y range.
                                          // Let's use strict overlap: dy < hSum
    
    // Check Y-axis touch (gap in Y, overlap in X)
    const isYTouch = Math.abs(dy - (hSum + GAP)) < 1;
    const isXOverlap = dx < (wSum + GAP); // dx < wSum

    if ((isXTouch && dy < hSum + GAP) || (isYTouch && dx < wSum + GAP)) {
      count++;
    }
  }
  return count;
}

/**
 * Generate candidate positions for a new word around an existing anchor word.
 * We explore placing the new word on top, bottom, left, right of the anchor.
 */
function getCandidatesAround(anchor: Rect, newLabelDims: {width: number, height: number, rotation: 0|90|180|270}): Rect[] {
    const candidates: Rect[] = [];
    const { width, height, rotation } = newLabelDims;

    // 1. Right Side
    candidates.push({
        x: anchor.x + anchor.width / 2 + GAP + width / 2,
        y: anchor.y, // center-aligned
        width, height, rotation
    });
    // Align Top edge (new.top = anchor.top) -> new.y - h/2 = anchor.y - anchor.h/2
    candidates.push({
        x: anchor.x + anchor.width / 2 + GAP + width / 2,
        y: anchor.y - anchor.height/2 + height/2, 
        width, height, rotation
    });
    // Align Bottom edge
    candidates.push({
        x: anchor.x + anchor.width / 2 + GAP + width / 2,
        y: anchor.y + anchor.height/2 - height/2,
        width, height, rotation
    });

    // 2. Left Side
    candidates.push({
        x: anchor.x - anchor.width / 2 - GAP - width / 2,
        y: anchor.y,
        width, height, rotation
    });
     candidates.push({
        x: anchor.x - anchor.width / 2 - GAP - width / 2,
        y: anchor.y - anchor.height/2 + height/2,
        width, height, rotation
    });
     candidates.push({
        x: anchor.x - anchor.width / 2 - GAP - width / 2,
        y: anchor.y + anchor.height/2 - height/2, // Fixed sign
        width, height, rotation
    });

    // 3. Bottom Side
    candidates.push({
        x: anchor.x,
        y: anchor.y + anchor.height / 2 + GAP + height / 2,
        width, height, rotation
    });
    // Align Left
    candidates.push({
        x: anchor.x - anchor.width/2 + width/2,
        y: anchor.y + anchor.height / 2 + GAP + height / 2,
        width, height, rotation
    });
     // Align Right
    candidates.push({
        x: anchor.x + anchor.width/2 - width/2,
        y: anchor.y + anchor.height / 2 + GAP + height / 2,
        width, height, rotation
    });

    // 4. Top Side
    candidates.push({
        x: anchor.x,
        y: anchor.y - anchor.height / 2 - GAP - height / 2,
        width, height, rotation
    });
     candidates.push({
        x: anchor.x - anchor.width/2 + width/2,
        y: anchor.y - anchor.height / 2 - GAP - height / 2,
        width, height, rotation
    });
    candidates.push({
        x: anchor.x + anchor.width/2 - width/2,
        y: anchor.y - anchor.height / 2 - GAP - height / 2,
        width, height, rotation
    });

    return candidates;
}


export const generateRadialPackedWords = (count: number = 50, sortingType: number = 1): PlacedWord[] => {
  // 1. Initialize
  const pickedWords = [...RELATED_WORDS].sort(() => 0.5 - Math.random()).slice(0, count);
  const placed: PlacedWord[] = [];

  // 2. Place first word at center
  const firstWord = pickedWords[0];
  const firstRot = [0, 90, 180, 270][Math.floor(Math.random() * 4)] as 0|90|180|270;
  const firstDims = getWordDimensions(firstWord, firstRot);
  
  placed.push({
    text: firstWord,
    x: 0,
    y: 0,
    width: firstDims.width,
    height: firstDims.height,
    rotation: firstRot
  });

  // 3. Loop
  for (let i = 1; i < pickedWords.length; i++) {
    const word = pickedWords[i];
    
    let allCandidates: Rect[] = [];

    // Try ALL rotations for this word to find the best spot that satisfies constraints
    const possibleRotations = [0, 90, 180, 270] as const;

    for (const rotation of possibleRotations) {
        const dims = getWordDimensions(word, rotation);
        
        let currentRotCandidates: Rect[] = [];
        for (const anchor of placed) {
            currentRotCandidates.push(...getCandidatesAround(anchor, { ...dims, rotation }));
        }

        // Filter: 
        // 1. Must not overlap
        // 2. Must not touch any neighbor with the SAME rotation (Constraint: "same alignment degree will never touch together")
        currentRotCandidates = currentRotCandidates.filter(c => {
             if (isOverlapping(c, placed)) return false;

             // Check touching neighbors for same rotation
             // simple check: iterate all placed, if isTouching(c, p) && c.rotation == p.rotation => invalid
             for (const p of placed) {
                 // Reuse logic from getConnectionCount but simpler "is touching" check
                 const dx = Math.abs(c.x - p.x);
                 const dy = Math.abs(c.y - p.y);
                 const wSum = (c.width + p.width) / 2;
                 const hSum = (c.height + p.height) / 2;
                 
                 const isXTouch = Math.abs(dx - (wSum + GAP)) < 1 && dy < (hSum + GAP);
                 const isYTouch = Math.abs(dy - (hSum + GAP)) < 1 && dx < (wSum + GAP);

                 if ((isXTouch || isYTouch) && c.rotation === p.rotation) {
                     return false; 
                 }
             }
             return true;
        });

        allCandidates.push(...currentRotCandidates);
    }
    
    if (allCandidates.length === 0) {
        continue;
    }

    // Sort by distance to center
    allCandidates.sort((a, b) => {
        const da = Math.sqrt(a.x*a.x + a.y*a.y);
        const db = Math.sqrt(b.x*b.x + b.y*b.y);
        
        const conA = getConnectionCount(a, placed);
        const conB = getConnectionCount(b, placed);

        // Strict connectivity priority (Higher connections = denser packing)
        // If connection counts differ, prefer the higher one
        if (conA !== conB) {
            return conB - conA; // Descending order of connectivity
        }

        // Secondary: Closest to center
        return da - db;
    });

    const best = allCandidates[0];

    placed.push({
        text: word,
        ...best
    });
  }

  return placed;
};
