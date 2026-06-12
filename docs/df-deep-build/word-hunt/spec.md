# Spec — word-hunt (Hero Word-Hunt Game)

> **Immutable.** This is the compiled mega-prompt and the source of truth. If
> something here needs to change, the interview phase runs again — don't edit
> in place during execute.

## ROLE
Senior React/TypeScript engineer adding a polished, performant micro-game inside
an existing Next.js 16 (static-export) portfolio. Match the codebase's
framer-motion + Tailwind conventions and the light/gold theme.

## OBJECTIVE
Add a "Word Hunt" mini-game to the portfolio hero (`/portfolio` Main page). A
START bracket-button enters a total-focus mode that **REUSES the existing hero
word cloud** as the game board: the cloud re-randomizes (sparse), centers,
becomes clickable; for 15s the player clicks the highlighted target word (named
bottom-center) to score, each correct hit shattering the word; then an end
screen shows score + best with replay/back.

## CONTEXT
```
- Project: ~/Dev/portnext — Next.js 16 output:'export', React, TS, framer-motion,
  Tailwind, lucide-react. Deploys to fiez.dev via Vercel on push to main.
- Hero = /portfolio → PortfolioV2Content → PortfolioCanvas → PageContent
  (page 'Main') → MainSection.tsx (PORTFOLIO gold heading, glitch job-title,
  italic quote, scroll-hint) in the 61.8% content panel.
- EXISTING text cloud lives in PortfolioCanvas.tsx: SVG <text> words from
  useCloudText.ts. useCloudText: LAYERS_CONFIG = 2 layers; totalWords hardcoded
  80; words from generateRadialPackedWords(totalWords, sortingType)
  (shared/radialPacking.ts); items = {text,x,y,rotation(0|90|180|270),
  fontSize:36,isHighlighted,highlightColor,shouldGlow}; positioned at offset
  position={x:800,y:500} within SVG viewBox "0 0 1000 1000" preserveAspectRatio
  slice; rendered pointer-events-none, z-0, animate opacity→0.2, fill
  rgba(80,85,95,0.7); gated by showBackground = currentPage==='Main'. There's a
  highlight loop (random words flicker) every 5s.
- Portrait at right 38.2% (PortfolioCanvas, showBackground). Content panel:
  h-full overflow-y-auto, w-full md:w-[61.8%] on Main.
- Fixed bottom nav (~54px, z-[100]) lives in PortfolioV2Content.tsx
  (MAIN/ABOUT/SKILL/PROJECTS/CONTACT, gold #FBBF24 active pill).
- Word source: motto.ts → RELATED_WORDS (~65: PASSION, CREATE, REMARKABLE,
  BUILD, DESIGN, CODE, CRAFT, EVOLVE, PRECISION, …) + generateScatteredWords
  (grid-jitter scatter). radialPacking.ts → generateRadialPackedWords.
- Theme: light (bg-white + stone-50/amber-50 gradient + faint SVG noise),
  gold #FBBF24 / yellow-400/500, text gray-900/600/400. GoldHeading = gold
  gradient text.
- PRIOR TRAP: previews that render a bare section MISS the fixed nav — verify by
  rendering the REAL PortfolioV2Content shell (drive it to Main with Playwright;
  DOM-click nav buttons via element.click() since framer-motion overlay
  intercepts).
```

## GAME DESIGN (decided with user)
- Flow: `idle` (START) → `playing` (15s) → `over` (end screen).
- START button: tall LEFT-BRACKET shape (open to the right; rounded
  top-left/bottom-left; top+left+bottom strokes) with "START!" inside, at hero
  LEFT-CENTER. Gold accent + hover glow.
- On START (TOTAL FOCUS MODE): hide hero (MainSection content + portrait) AND
  the fixed bottom nav. REUSE the existing useCloudText cloud as the board:
  - Re-randomize it sparse (~20–24 words from RELATED_WORDS) with a fresh seed.
  - "Move to center": animate cloud from decorative state (right-biased,
    opacity 0.2, behind, pointer-events-none) to centered, full-opacity,
    scaled-in, pointer-events-AUTO/clickable.
- Targets SEQUENTIAL one at a time: the target (one of the cloud's own words)
  shown bottom-center pill ("Find: CRAFT"); that same <text> ramps a gold glow
  (text-shadow/fill) subtle→intense over ~2s, holds at max until clicked.
  Correct click → word SHATTERS into per-letter SVG fragments that fly out +
  fade (framer-motion), +1 point, next target picked from remaining words
  instantly. Target never auto-expires (only the global 15s).
- Wrong click: quick red shake on the clicked word; NO score/time penalty.
- Timer: 15s countdown shown top (bar/number), pulses/reddens last 5s.
- End screen: final score + "Best: N" (localStorage) + Play Again + Back (to
  hero). No rank titles.
- Quit: ✕ top-right exits to hero anytime (nav hidden).
- Extra juice (lightweight; approved): live streak indicator during play
  (visual only, does NOT change +1 scoring); brief cloud-assemble-in animation
  on start; subtle hover lift/scale on words (desktop).

## ARCHITECTURE
- REUSE useCloudText's SVG cloud in PortfolioCanvas as the board — NO
  separate/new cloud. Parametrize useCloudText: word count (sparse ~20 in game),
  a regen `seed`, and a `gameActive` mode that flips position→center,
  opacity→1, pointer-events→auto, and exposes per-word click + glow + shatter
  (disable the decorative 5s highlight loop during game).
- Game state via small useHeroGame.ts hook. Pure logic in heroGameLogic.ts
  (React-free): pickNextTarget(words, prevTarget), scoring/streak helpers,
  formatTime, sparse-scatter/selection helper — UNIT-TESTED.
- HUD overlay (timer / target pill / live score+streak / ✕ / end screen) + the
  START bracket button render in PortfolioCanvas over the Main page.
- Lift ONE `gameActive` boolean to PortfolioV2Content so it hides the bottom nav.
- Clickable words remain the existing SVG <text> (motion.text) made
  interactive; shatter = split target word into per-letter motion.text/tspan
  fragments animating translate+rotate+opacity out (≤8 fragments).

## OUTPUT FORMAT
- New: `src/components/portfolio/v2/game/{heroGameLogic.ts,
  heroGameLogic.test.ts, useHeroGame.ts, GameHUD.tsx, StartBracket.tsx}`
- Modified: `useCloudText.ts` (sparse count + seed + gameActive transform +
  expose handlers), `PortfolioCanvas.tsx` (game mode on cloud + HUD + START),
  `PortfolioV2Content.tsx` (own gameActive → hide nav). `MainSection.tsx`: hero
  hidden via gameActive (minimal/none).
- tsc clean; unit tests pass; no new heavy deps (framer-motion present).

## REASONING APPROACH
Keep render cost low: ~20 word nodes, GPU-friendly transform/opacity-only
animation, single timer driven by ref/rAF or 100ms tick (no per-frame React
thrash), memoized scatter, respect prefers-reduced-motion (fragments degrade to
fade). TDD the pure logic first, then component, then verify in the real shell.

## CONSTRAINTS
- Fast to render — sparse cloud, transform/opacity-only, no canvas, no per-frame
  state thrash.
- Fully responsive + touch-friendly; cloud + tap targets scale for phones.
- Respect prefers-reduced-motion.
- Match light/gold theme + existing framer-motion/Tailwind idioms.
- Claude/self only — no Codex/Gemini/GLM.
- Don't regress the existing hero/cloud decorative behavior when NOT in game;
  game is additive + reversible.

## SUCCESS CRITERIA
- START bracket at hero left-center; click → focus mode (hero + nav hidden); the
  EXISTING cloud re-randomizes sparse, centers, becomes clickable.
- 15s countdown; sequential glowing targets drawn from the cloud's words;
  correct click shatters the word + scores +1 + advances; wrong click shakes only.
- End screen: score + Best + Play Again + Back; ✕ quits anytime.
- Smooth desktop + mobile; reduced-motion respected; tsc + unit tests green;
  visually QA'd in the REAL PortfolioV2Content shell at desktop + mobile.
