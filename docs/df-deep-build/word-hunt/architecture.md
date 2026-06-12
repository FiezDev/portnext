# Architecture — word-hunt

**Chosen approach:** Reuse the existing `useCloudText`/`PortfolioCanvas` SVG
cloud as the game board; feed it a **seeded sparse scatter** (new helper) for
game mode; `gameActive` state lifted to `PortfolioV2Content`; START + HUD live
in `PortfolioCanvas`. One-line reason: smallest, reversible diff that honors
"reuse the existing cloud" while giving clean, clickable, fast sparse layout.

## Key decisions

1. **State location — `useState` in `PortfolioV2Content`, no context.**
   `gameActive` + `setGameActive` lifted to `PortfolioV2Content`; threaded to
   `PortfolioCanvas` as `gameActive` + `onGameActiveChange`. Nav hidden via
   `{!gameActive && <nav .../>}`. `MainSection`/`PageContent` receive nothing.

2. **Reuse the cloud render; regenerate positions for game mode.**
   Parametrize `useCloudText({ count, seed, gameActive })`:
   - `gameActive` true → build items from the new **seeded sparse scatter**
     (centered at viewBox (500,500), ~20 unique words from `RELATED_WORDS`),
     a single interactive set; disable the 5s decorative highlight loop.
   - `gameActive` false → current behavior unchanged (80 words, offset
     (800,500), decorative). Defaults preserve today's render exactly.
   - **Precompute per-item anim timing** (kill the in-render `Math.random()` at
     PortfolioCanvas.tsx:75-76) so timer-tick re-renders don't restart word
     animations.

3. **Seeded sparse scatter** (`heroGameLogic.ts`, pure + unit-tested):
   - `mulberry32(seed)` PRNG (no RNG exists in repo).
   - `pickGameWords(allWords, n, rng)` → `n` UNIQUE words.
   - `scatterWords(words, rng, {centerX:500, centerY:500, ...})` → non-overlapping
     `{text,x,y,rotation(0|90|180|270),fontSize}` via centered jittered grid with
     overlap rejection (monospace width = fontSize*0.7).
   - `pickNextTarget(words, prev)` (never repeats back-to-back), `formatTime`,
     score/streak helpers, `loadBest`/`saveBest` (localStorage-guarded).

4. **Clickable cloud + glow.** In game mode the cloud layer goes `z-30` with
   `pointerEvents="auto"` + `onClick` + `cursor:pointer` per `<motion.text>`.
   Target glow reuses the dead `highlightColor`/`shouldGlow` fields → conditional
   `fill` (gold `#FBBF24`) + SVG `filter` drop-shadow ramp (subtle→intense ~2s,
   hold). Wrong click → quick red shake (x keyframes) on the clicked word.

5. **Shatter** = on correct click, replace the target `<motion.text>` with its
   letters as individual `<motion.text>` fragments (≤8), positions **pre-rotated
   in JS** (0/90/180/270 matrix around word center; char width 25.2 @ fs36) to
   avoid nested SVG transform composition; animate translate+rotate+opacity→0.

6. **Hero hide.** Portrait → `showBackground && !gameActive`. Content panel
   (`<PageContent>`) kept MOUNTED but `opacity-0 pointer-events-none` when
   `gameActive` (avoids MainSection stagger replay on exit). START + HUD render
   as `absolute inset-0` overlays inside PortfolioCanvas's `relative ...
   overflow-hidden` div (the correct anchor; clipped at 1366px → keep inset).

7. **HUD layering.** `GameHUD` overlay at `z-40`, container `pointer-events-none`;
   only its controls (✕ top-right, target pill, Play Again/Back, end-screen
   backdrop) are `pointer-events-auto` so cloud word-clicks pass through.

8. **Timer (no per-frame thrash).** `useHeroGame`: one `setTimeout(15000)` →
   phase 'over'; a `setInterval(1000)` updates integer `secondsLeft` (≤15
   renders); the countdown BAR is a CSS width transition (100%→0 over 15s) that
   reddens/pulses in the last 5s. Score/target updates are event-driven (on
   click), not timed.

9. **Reduced motion.** `useReducedMotion()` → shatter degrades to fade, glow
   becomes a static highlight, assemble-in is instant, bar pulse off.

10. **Jest setup (T1 prerequisite).** No jest config exists. Add
    `jest.config.ts` via `next/jest` + `jest.setup.ts`
    (`@testing-library/jest-dom`). Pure-logic tests need no jsdom but config
    should transform TS/TSX. `npm test` already wired (`jest --verbose`).

## Alternatives considered
- **Seed existing radialPacking** (literal reuse): rejected — packs tight/
  overlap-prone, poor click targets, looks clustered not sparse.
- **Spread radialPacking output** (post-process apart): rejected — fiddlier to
  tune for marginal "radial feel" benefit.
- **React context for gameActive:** rejected — over-engineering for 2-level drill.
- **Separate portal cloud:** rejected earlier by the human — must reuse the cloud.
- **Unmount PageContent on game start:** rejected — replays MainSection stagger
  on exit; use opacity toggle.

## Constraints inherited from exploration
- Reuse the cloud's SVG render + `RELATED_WORDS` + visual style (human's hard req).
- Don't regress decorative cloud when `gameActive` is false (defaults preserve it).
- Fast to render: ~20 nodes, transform/opacity only, memoized items, no per-frame
  state. Precompute anim timing (fixes existing jitter bug).
- Verify in the REAL `PortfolioV2Content` shell (bare-section preview omits the
  fixed nav). Playwright must DOM-`click()` nav buttons (framer-motion intercepts).
- Claude/self only.

## Open questions / risks
- SVG `filter` drop-shadow glow can be GPU-costly if applied to many nodes — apply
  ONLY to the single current target, not all words.
- Clicking small rotated SVG `<text>` on mobile: ensure adequate hit area (the
  text glyph bounding box). If too fiddly, add an invisible padded `<rect>` hit
  target per word in game mode. Validate in T5 mobile QA.
- `next/jest` in Next 16 — confirm import path resolves during T1; fallback to a
  minimal `ts-jest`/babel transform for the pure-logic file if needed.
