# Tasks — projects-ux-redesign

Source of truth for execution order. Status flips inline; agents re-read this on
every entry. (Content/UI task — "tests" = `tsc --noEmit` + visual review.)

Status legend: `[ ]` todo · `[~]` in-progress · `[x]` done

## T1 — Layout fill + dark-glass card + gold toggle
- **Status:** [x] done
- **Depends on:** —
- **Acceptance:**
  - [ ] ProjectsSection top-aligned (no `justify-center`); content fills the panel — no empty top
  - [ ] ProjectCard restyled to dark-navy translucent glass + gold accents (no white card)
  - [ ] Work/Side toggle restyled (active=gold, inactive=dark glass)
  - [ ] bigger image; image-left/info-right desktop, image-top/info-below mobile
  - [ ] `tsc --noEmit` clean
- **Tests:** tsc + before/after screenshot
- **Notes:**

## T2 — Thumbnail-strip project navigator
- **Status:** [x] done
- **Depends on:** T1
- **Acceptance:**
  - [ ] thumbnail strip below the card: one thumb per project (first image), click to jump
  - [ ] active thumb gold-ringed; horizontal-scroll on mobile; keep prev/next arrows
  - [ ] blind dot indicators removed
  - [ ] `tsc --noEmit` clean
- **Tests:** tsc + visual (click thumb → switches project)
- **Notes:**

## T3 — Full-screen zoom Lightbox
- **Status:** [x] done
- **Depends on:** T1
- **Acceptance:**
  - [ ] new Lightbox component: click/tap image → full-screen zoom + pan
  - [ ] arrows between the project's images; pinch-zoom + swipe on touch
  - [ ] close on ✕ / Esc / backdrop; ⤢ hint on the card image; alt text
  - [ ] `tsc --noEmit` clean
- **Tests:** tsc + visual (open/zoom/pan/close)
- **Notes:**

## T4 — Responsive QA + polish
- **Status:** [x] done
- **Depends on:** T1, T2, T3
- **Acceptance:**
  - [ ] verified at mobile (~375), tablet (~768), desktop (~1440) — no horizontal overflow
  - [ ] thumbnail strip + lightbox + card all behave at each breakpoint
  - [ ] final theme polish (spacing, contrast, gold accents)
- **Tests:** multi-width screenshots
- **Notes:**

---
**Closeout:** after all tasks — `tsc` clean, commit(s) pushed to main (token-URL;
re-bridge a GH token if push fails). Show before/after.
