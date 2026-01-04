export const getMottoString = (length: number) => {
  const motto = "PASSIONATE TO MAKE THE REMARKABLE THING";
  return motto.repeat(Math.ceil(length / motto.length)).slice(0, length);
};


export const RELATED_WORDS = [
  "PASSION", "CREATE", "REMARKABLE", "BUILD", "DESIGN", "CODE", "LOGIC", "MAGIC", 
  "CRAFT", "PIXEL", "DEPTH", "VISION", "FUTURE", "BOLD", "IMPACT", "SOLVE", 
  "DREAM", "FOCUS", "GRIT", "FLOW", "MOTION", "SPACE", "TIME", "VALUE", 
  "USER", "EXPERIENCE", "INTERFACE", "SYSTEM", "CORE", "WEB", "NATIVE", 
  "FLUID", "DYNAMIC", "STABLE", "FAST", "CLEAN", "PURE", "ZEN", "ART", 
  "SKILL", "MASTERY", "DRIVE", "SPARK", "IDEA", "LAUNCH", "SCALE", "INNOVATE",
  "EVOLVE", "ADAPT", "LEARN", "GROWTH", "MINDSET", "CLARITY", "SIMPLE", "MODERN",
  "ROBUST", "AGILE", "STORY", "JOURNEY", "INSPIRE", "ELEGANCE", "PRECISION", "HARMONY",
  "CONNECT"
];

interface WordItem {
  text: string;
  top: number;
  left: number;
  rotation: number;
  fontSize: number;
}

export const generateScatteredWords = (count: number): WordItem[] => {
  const shuffled = [...RELATED_WORDS].sort(() => 0.5 - Math.random()).slice(0, count);
  const items: WordItem[] = [];

  // Grid Grid algorithm to prevent overlap
  // We divide space into a generic grid (e.g., 6x8)
  const rows = 8;
  const cols = 6;
  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ r, c });
    }
  }

  // Shuffle cells to randomize positions
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  shuffled.forEach((word, index) => {
    if (index >= cells.length) return; // Should not happen if count < rows*cols

    const cell = cells[index];
    // Base position from grid cell (center of cell)
    const cellH = 100 / rows;
    const cellW = 100 / cols;
    
    // Add randomness within the cell (-40% to +40% of cell size)
    const randomX = (Math.random() - 0.5) * 0.8 * cellW;
    const randomY = (Math.random() - 0.5) * 0.8 * cellH;

    const top = cell.r * cellH + (cellH / 2) + randomY;
    const left = cell.c * cellW + (cellW / 2) + randomX;

    // Rotation: 45 +/- 15 degrees.
    // "plus a degreaa to all remdonness to" -> Base variation
    // "word can start from left to right right to left" -> Flip 180
    const baseAngle = 45;
    const variation = Math.random() * 30 - 15; // -15 to +15
    const isFlipped = Math.random() > 0.5;
    
    // If flipped, add 180. This keeps text readable (not mirrored), just upside down flow.
    const rotation = baseAngle + variation + (isFlipped ? 180 : 0);

    const fontSize = 10 + Math.random() * 12; // 10px to 22px

    items.push({ text: word, top, left, rotation, fontSize });
  });

  return items;
};

// Kept for backward compatibility if needed, but generateScatteredWords is preferred
export const getRandomUniqueWords = (count: number) => {
  return generateScatteredWords(count).map(w => w.text);
};
