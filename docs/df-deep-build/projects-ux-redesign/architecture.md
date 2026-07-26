# Architecture — projects-ux-redesign

**Chosen approach:** Minimal-diff restyle of the two existing components + one
new self-contained `Lightbox`. No new deps, no data changes. (Single obvious
approach; Claude/self only — no design fan-out.)

## Component plan
- **ProjectsSection.tsx**
  - Drop `justify-center`; top-align and let the card fill the panel
    (`flex flex-col` + the card area `flex-1`/grows). Reduce wasted vertical space.
  - Restyle Work/Side toggle: active = gold (`bg-yellow-500 text-[#1B262C]`),
    inactive = dark glass (`bg-white/5 border-white/15 text-gray-300`).
  - Replace the blind dot row with a **thumbnail strip**: map `projects` →
    one thumbnail (first image via `resolveImageSrc`) per project; click =
    `setCurrentIndex`; active = gold ring (`ring-2 ring-yellow-400`);
    `overflow-x-auto` + `snap-x` for mobile scroll. Keep prev/next arrows as a
    small secondary control. Keep the `X / N` counter (subtle).
- **ProjectCard.tsx**
  - Container: white → **dark glass** — `bg-[#1B262C]/60 backdrop-blur-md
    border border-yellow-500/20 shadow-xl`. Text → light (`text-gray-100`),
    secondary `text-gray-400`; stack badges `bg-white/5 text-gray-200`.
  - Image bigger + responsive: desktop `md:flex-row`, image `md:w-[45%]`,
    height grows (e.g. `h-56 md:h-full md:min-h-[320px]`); mobile = image on top.
  - Image is a `<button>` → opens the Lightbox at the current index; show a ⤢
    hint badge on hover/idle. Keep the within-project prev/next + dots for
    multi-image projects.
- **Lightbox.tsx** (NEW, `shared/Lightbox.tsx`)
  - Props: `images: string[]`, `index`, `open`, `onClose`, `onIndexChange`, `alt`.
  - Full-screen fixed overlay (z-高, `bg-black/90`), rendered when `open`.
  - Zoom: `+ / − / reset` buttons + mouse-wheel; **pinch** via 2-finger touch.
  - Pan: pointer drag when `scale > 1` (works mouse + touch).
  - Image nav: prev/next arrow buttons + keyboard ←/→.
  - Close: ✕ button, `Esc`, backdrop click. `role="dialog"`, `aria-modal`,
    focus the close button on open, restore on close. Plain `<img>` with
    `transform: scale()/translate()` (next/image fill is awkward for free zoom).

## Key decisions
- Lightbox owned by ProjectCard (it already has the image list + current index) —
  self-contained, no state lifting.
- Pinch + wheel + buttons cover zoom on every device; pan via pointer drag covers
  mouse and touch with one handler. Arrows (not swipe) for image nav = reliable
  on all inputs.
- Reuse theme tokens (navy `#1B262C`, `yellow-400/500`, glass) so it matches.

## Alternatives considered
- A zoom/pan npm lib (react-zoom-pan-pinch) — rejected: "no heavy new deps".
- Embla for the thumbnail strip — rejected: a plain `overflow-x-auto` flex row is
  lighter and snaps fine.

## Constraints inherited from exploration
- Must work inside the golden-ratio panel (`h-full overflow-y-auto`, 61.8%/full).
- Local `/screenshot` images via `resolveImageSrc`. `tsc` clean. No mobile
  horizontal overflow.

## Risks
- Pinch-zoom touch math is the fiddliest bit — keep it simple (distance ratio →
  scale), clamp scale 1–4, reset on image change. Verify on a narrow viewport.
