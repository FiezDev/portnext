# Context — word-hunt

Recon findings + patterns. Later phases (plan, execute, review) APPEND here.

## Files read during recon
- `src/components/portfolio/v2/sections/MainSection.tsx` — the hero content:
  PORTFOLIO `GoldHeading`, glitch job-title (`useGlitchText`), italic quote with
  breathing glow, scroll-hint. Wrapped in `flex flex-col justify-center h-full
  p-6 md:p-12`. Renders inside the 61.8% content panel. **No cloud here.**
- `src/components/portfolio/v2/PortfolioCanvas.tsx` — owns the decorative cloud
  (SVG `<text>` from `useCloudText`, mapped over `memoizedLayers`,
  `pointer-events-none`, z-0, `animate opacity→0.2`, fill `rgba(80,85,95,0.7)`),
  the portrait (right 38.2%, `showBackground`), and the content panel
  (`h-full overflow-y-auto z-20`, `w-full md:w-[61.8%]` on Main). All decorative
  bits gated by `showBackground = currentPage==='Main'`. AnimatePresence page
  transitions via `useComplexTransition`.
- `src/components/portfolio/v2/hooks/useCloudText.ts` — generates `layers`
  (`LAYERS_CONFIG` = 2 layers) × items `{text,x,y,rotation(0|90|180|270),
  fontSize:36,isHighlighted,highlightColor,shouldGlow}`. `totalWords` hardcoded
  **80**; `generateRadialPackedWords(totalWords, sortingType)`; offset
  `position={x:800,y:500}`. Has a 5s **highlight loop** (random flicker) +
  `forceUpdate`. Returns `{ layers: combinedLayers }`. Regenerates on dep change
  of `position/sortingType/colorFlag/color/glowFlag`.
- `src/components/portfolio/v2/shared/motto.ts` — `RELATED_WORDS` (~65 words),
  `generateScatteredWords(count)` (8×6 grid-jitter scatter → `{text,top,left,
  rotation,fontSize}` in % units), `getRandomUniqueWords`.
- `src/components/portfolio/v2/shared/PageContent.tsx` — switch on PageId →
  section component. 'Main' → `<MainSection/>`.
- `src/components/PortfolioV2Content.tsx` (from earlier session) — owns the
  fixed bottom nav (`fixed bottom-0 ... z-[100]`, ~54px) + page state
  (`currentPage`, `handlePageChange`). Wrapper `bg-white` + gradient + noise.

## Patterns to follow
- **Reuse the existing cloud** — the game board MUST be the `useCloudText` SVG
  cloud, transformed (sparse, centered, full-opacity, clickable), not a new one.
- SVG cloud lives in `viewBox "0 0 1000 1000"` (`preserveAspectRatio xMidYMid
  slice`). Center = (500,500). Decorative offset is (800,500) (right-biased).
- Theme tokens: gold `#FBBF24` / `yellow-400/500`; text `gray-900/600/400`;
  light bg. `GoldHeading` for gold gradient headings. framer-motion everywhere.
- Animate **transform/opacity only** (perf). framer-motion `motion.*` + variants
  are the existing idiom. Words are `fontFamily="monospace" fontWeight="bold"`.
- `showBackground`/`gameActive`-style boolean gating is the existing pattern for
  Main-only chrome.

## Verification protocol (learned the hard way this session)
- A bare-section preview route OMITS the fixed bottom nav and produced two false
  "looks fine" verdicts earlier. **Verify in the REAL `PortfolioV2Content`
  shell.** Drive `/portfolio` with Playwright; framer-motion's `layoutId`
  overlay intercepts normal clicks, so switch pages via in-page
  `element.click()` (`[...document.querySelectorAll('button')].find(b =>
  b.textContent.trim()==='Projects').click()`), not `getByRole().click()`.
- Routing: `/` = dark hex landing (`MainContent`), `/work` = dark card grid
  (`WorkContent`), **`/portfolio` = the v2 word-cloud shell** (this game's home).
- Build verify: push to main → Vercel auto-deploys; the cloud/game chunk is
  code-split (not in the homepage's initial chunks), so verify by driving the
  live `/portfolio` page, not by grepping homepage JS.

## Open questions the human deferred
- None outstanding. All design decisions locked in the interview (see spec.md
  GAME DESIGN). "Fast to render" is a hard constraint the user emphasized twice.

## Constraints inherited
- Claude/self only (no Codex/Gemini/GLM).
- Additive + reversible: do not regress the decorative cloud when not in game.

---

## Exploration (plan phase — 2026-06-12)

### Cloud render internals (Explore agent 1)
- **Coordinate system:** cloud SVG `viewBox 0 0 1000 1000`, `preserveAspectRatio slice`.
  `generateRadialPackedWords` seeds word 0 at (0,0) and packs outward → cluster
  centered on origin, ±350–450 units for 80 words. useCloudText offsets by
  `position={x:800,y:500}` (right-biased, behind portrait). **Center = position
  {x:500,y:500}.** (radialPacking.ts:184-278, useCloudText.ts:64-67,
  PortfolioCanvas.tsx:31)
- **radialPacking packs TIGHT, not sparse** — 20 words → tight cluster ±150-200,
  overlap-prone. Sparse needs a deliberate scatter (random/grid + overlap reject),
  NOT just fewer words.
- **No seedable RNG anywhere** (grepped seed/mulberry/PRNG/lcg). Layout randomness
  = radialPacking.ts:186 (word shuffle) + :191 (first rotation). Need mulberry32.
- **<motion.text> props** (PortfolioCanvas.tsx:79-99): x,y,fontFamily="monospace",
  fontWeight=bold, fontSize=36, textAnchor=middle, dominantBaseline=middle,
  transform=`rotate(rot,x,y)`, fill="rgba(80,85,95,0.7)" (HARDCODED),
  animate opacity `isHighlighted?0:[0.3,0.75,0.3]`.
- **highlightColor + shouldGlow are DEAD fields** — carried in data, never used in
  JSX. Free hooks for game glow (add conditional fill + SVG filter).
- **animDuration/animDelay use Math.random() IN-RENDER** (PortfolioCanvas.tsx:75-76)
  inside the .map → every re-render reassigns timings → animation resets. MUST
  precompute into item data / useMemo for game mode (else timer ticks = jitter).
- **Clickability:** cloud layer is `pointer-events-none z-0`; content panel z-20 is
  full-width on mobile (covers cloud). Game mode: raise cloud to z-30 +
  `pointerEvents="auto"` + onClick + cursor on each text, AND hide/disable the
  content panel so it doesn't block.
- **Shatter:** monospace char width = fontSize*0.7 = 25.2 at fs36. Split word into
  N <motion.text> letters; PRE-ROTATE letter positions in JS (apply 0/90/180/270
  matrix around word center) to avoid nested SVG transform composition. ≤8 frags,
  animate translate+rotate+opacity→0.
- **Highlight loop** (useCloudText.ts:82-107): setInterval 5s. Disable in game via
  `colorFlag: showBackground && !gameActive` at the call site (short-circuits the
  whole hook), or add gameActive guard+dep.

### Shell state + nav + layering (Explore agent 2)
- **State location:** `useState` gameActive in PortfolioV2Content (NO context —
  over-engineering for 2-level drill). Thread `gameActive` + `onGameActiveChange`
  → PortfolioCanvas (add to its props interface, lines 10-13). MainSection/
  PageContent need NOTHING (PageContent only takes {page}).
- **Nav hide:** `{!gameActive && <div className="fixed bottom-0 ... z-[100]">…}`
  — conditional render, NOT z-cover (nav is fixed → own stacking context).
- **Z-map:** noise z-0, content wrapper z-10, cloud z-0..N, portrait img z-20,
  content panel z-20, nav z-[100]. **HUD overlay = z-30** inside PortfolioCanvas's
  `relative w-full h-full overflow-hidden` div (line 56) = correct absolute anchor.
- **Hero hide gating:** portrait → `showBackground && !gameActive` (line 107);
  content panel → swap/hide `<PageContent>` when `gameActive && currentPage==='Main'`.
- **Transition safety:** AnimatePresence keys on `currentPage` only → toggling
  gameActive causes NO page remount/re-animation. GOTCHA: if you UNMOUNT
  PageContent on toggle, MainSection's stagger replays on exit → prefer
  opacity/visibility toggle (keep mounted) over conditional unmount.
- **GoldenContainer** (GoldenLayout.tsx:12-23): inner div `relative w-full h-full
  overflow-hidden`, max-width 1366px → clips overflow; correct anchor for an
  `absolute inset-0 z-30` HUD. Keep HUD inset.

### Plan-phase decisions derived
- **Jest has NO config** (verified): `test:jest` script + deps exist, zero config,
  zero test files. T1 must add `jest.config.ts` via `next/jest` + `jest.setup.ts`
  (`@testing-library/jest-dom`). Pure-logic tests (heroGameLogic) don't need jsdom
  but the config should support TS/TSX for future. framer-motion ^12.23, React 19,
  Next ^16.1, `@/*`→`./src/*`.
- **Reuse fidelity:** reuse the cloud's SVG RENDER + word source (RELATED_WORDS) +
  visual style, but regenerate item positions for game mode via a seeded SPARSE
  scatter (own helper) — radialPacking won't give clean non-overlapping sparse.
- **Timer:** one `setTimeout(15000)` for end + integer-second state (≤15 renders)
  + CSS-animated progress bar (width 100%→0, reddens last 5s). No rAF/per-frame.
- **Reduced-motion:** `useReducedMotion()` → shatter degrades to fade, glow static,
  assemble-in instant, bar no pulse.
