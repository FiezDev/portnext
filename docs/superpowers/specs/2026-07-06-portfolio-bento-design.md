# /portfolio Projects → Bento Grid — Design

Date: 2026-07-06
Scope: `src/components/portfolio/v2/sections/ProjectsSection.tsx` only. `ProjectCard`, data mocks, shell untouched.

## What

Replace the thumbnail-strip + carousel in the v2 Projects section with:

1. **Bento grid** — all projects of the selected type (Work/Side toggle stays).
   - CSS grid: 2 cols mobile, 4 cols md+. Cell spans come from a deterministic
     pattern cycled by index (no randomness in render → no SSR hydration mismatch).
   - Each tile: cover image (or name fallback), name label, button semantics,
     amber ring when featured, `cursor-pointer`, ≥44px touch target.
2. **Drift** — the grid container slowly translates toward a new random point
   (±20px box) every 2s (framer-motion tween, 2s, transform-only).
   Disabled under `prefers-reduced-motion`.
3. **Featured card** — the existing `ProjectCard` rendered in a viewport-centered
   fixed overlay (`z-[60]`, below bottom nav `z-[100]`). Auto-advances to the next
   project every 5s. Clicking a tile features it immediately and resets the timer.
   Hovering the card pauses auto-advance (so links/lightbox are usable).
   An ✕ button hides the card so tiles behind it are reachable; auto-advance
   re-shows the next one.

## Approaches considered

- **A (chosen)**: Tailwind grid + framer-motion (already installed). Shortest diff, reuses ProjectCard.
- B: GSAP absolute-position packing — more control, much more code. Rejected (YAGNI).
- C: react-grid-layout/muuri dep — new dependency for what CSS grid does. Rejected.

## Pieces

- `bentoLayout.ts` — pure helpers: `bentoSpanClass(i)`, `nextFeatured(cur, len)`,
  `driftTarget(rand, range)`. Unit-tested (`bentoLayout.test.ts`).
- `ProjectsSection.tsx` — rewritten around the grid + overlay. State: `projectType`,
  `featuredIndex`, `cardHidden`, `hoverPaused`, `drift {x,y}`.

## Error/edge handling

- Empty project list → no overlay, empty grid (types always have ≥1 today).
- Reduced motion → no drift; featured card still rotates (opacity fade only).
- Known ceiling: hover-pause doesn't cover the portal Lightbox on desktop if the
  pointer leaves the card bounds — acceptable; upgrade = lift zoom state up.

## Interpretation notes (flag to user)

- "Whole page slides" implemented as the **bento grid container** drifting, not the
  literal page (heading + toggle stay still so controls remain usable). Easy to widen.
