# spec.md — projects-ux-redesign

> **Immutable.** If something here changes, the interview phase ran again.

## Objective
Redesign the v2 portfolio Projects section to be space-efficient, navigable,
zoomable, and on-theme (dark navy `#1B262C` + gold glass), fully responsive
across mobile / tablet / desktop. Claude/self only — no Codex/Gemini/GLM.

## Tasks
1. **Layout / space** — section top-aligned (drop `justify-center`), content
   fills the panel height, larger image. Desktop = image left + info right
   (enlarged); mobile/tablet = image on top + info below. No empty top.
2. **Theme** — replace the `bg-white/70` card with a dark-navy translucent glass
   card + subtle gold border/accents; restyle the Work/Side toggle (active=gold,
   inactive=dark glass); light/grey text; keep GoldHeading.
3. **Navigation** — thumbnail strip BELOW the card: one thumbnail per project in
   the active category (first image), click to jump, active thumb gold-ringed,
   horizontal-scroll on mobile; keep prev/next arrows as secondary; replace the
   blind dots.
4. **Within-project** — keep the card's own image carousel (arrows/dots) for
   projects with multiple screenshots.
5. **Zoom** — new reusable Lightbox: tap/click any screenshot → full-screen with
   zoom (buttons/scroll) + pan (drag), arrows between that project's images,
   pinch-to-zoom + swipe on touch, close on ✕ / Esc / backdrop; ⤢ hint on the
   card image; next/image + resolveImageSrc; accessible (Esc, focus, alt).
6. **Responsive** — verify all breakpoints; no horizontal overflow on mobile.

## Context
Mounted in `PageContent` → `PortfolioCanvas` golden-ratio panel
(`h-full overflow-y-auto`, ~61.8% width desktop / full mobile). Theme tokens:
GoldHeading (yellow-500→amber-400→yellow-600 gradient), bg `#1B262C` navy,
gold/amber accents, glass/backdrop-blur. Libs: framer-motion, next/image,
`resolveImageSrc` (local `/screenshot` paths), lucide icons, shadcn
Button/Badge, embla. Data: `WorkProjects.projectPic.picurl.pic[]` +
`SideProjects.pic[]` via `resolveImageSrc`; Work/Side toggle + `activeFlag`
filter already present.

## Constraints
Claude/self only. Reuse existing theme tokens + libs (no heavy new deps). Stay
in the v2 portfolio; don't change project data. Must work within the
golden-ratio scrollable panel. Keep accessibility. `tsc --noEmit` must pass.
Fully responsive (no mobile horizontal overflow). Push via token-URL — note the
GH token was deleted/likely rotated; portnext is public so a fresh token may be
needed (ask the human to re-bridge one, or they push). Show before/after.

## Success criteria
No empty top space (content fills the panel); dark-glass on-theme card + toggle;
thumbnail project navigator works; full-screen zoom lightbox works on
desktop + touch; correct at mobile/tablet/desktop; `tsc` clean; pushed live.
