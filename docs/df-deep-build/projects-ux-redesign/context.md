# context.md — projects-ux-redesign

Seeded from interview recon. Later phases append below.

## Files read during recon
- `src/components/portfolio/v2/sections/ProjectsSection.tsx` — `flex flex-col
  justify-center h-full p-6 md:p-12` (centers → empty top/bottom); GoldHeading
  "Projects"; Work/Side toggle (white buttons); one ProjectCard at a time via
  `currentIndex` + AnimatePresence; nav = ChevronLeft/Right + blind dot buttons
  + `X / N` counter. `activeFlag !== false` filter + projectID sort already there.
- `src/components/portfolio/v2/sections/ProjectCard.tsx` — `bg-white/70
  backdrop-blur-sm` (WHITE card, clashes); left col `md:w-[45%]` image in a
  fixed `h-48 md:h-64` `object-contain` box with its own prev/next + dots; right
  col info (name/status, stack badges, desc bullets, links). Images via
  `resolveImageSrc`; `isWorkProject` uses `projectPic.picurl.pic`, side uses `pic`.
- `src/components/portfolio/v2/shared/PageContent.tsx` — switch on PageId →
  `<ProjectsSection/>` for 'Projects'.
- `src/components/portfolio/v2/PortfolioCanvas.tsx` — content panel
  `h-full overflow-y-auto ... w-full md:w-[61.8%]` (golden ratio); portrait
  image occupies the other 38.2% on ≥1366px.
- `src/components/portfolio/v2/shared/GoldHeading.tsx` — gold gradient text.
- `src/styles/globals.css` — `--color-bg: #1B262C` (navy), `--color-head
  #0F4C75`, `--color-light #BBE1FA`; gold/amber accents; noise bg image.

## Patterns to follow
- Dark navy + gold + glass (backdrop-blur). GoldHeading for headings.
- Reuse framer-motion, next/image (fill + object-contain/cover), resolveImageSrc,
  lucide icons, shadcn Button/Badge. embla available if a carousel helps.
- Tailwind responsive prefixes (sm/md/lg). The panel is 61.8% width desktop, full
  on mobile — design the card to work in both.
- Local /screenshot images ship with the static export.

## Design decisions (locked in interview)
- Project navigation = **thumbnail strip below the card** (one thumb per project,
  click to jump, active gold-ringed, horizontal-scroll on mobile); keep arrows.
- Zoom = **full-screen Lightbox** (zoom+pan+arrows; pinch+swipe on touch).
- Layout = **top-aligned, bigger image, dark-glass card** (image left/info right
  desktop; image-top/info-below mobile).
- **Fully responsive** is a baseline requirement for every piece.

## Open questions the human deferred
- None blocking. Push auth may need a fresh token (GH token deleted/rotated).
