# Portnext V2 Cinematic Upgrade — Design Spec

**Date:** 2026-05-03
**Author:** Ittipol (FiezDev) + Zenith
**Status:** Draft (awaiting user review)
**Scope:** `/portfolio` (V2) only. V1 remains untouched.

---

## 1. Goal

Turn the V2 portfolio at `/portfolio` into a cinematic, interactive experience using **GSAP** for orchestration and **Three.js / @react-three/fiber** for 3D scenes, while:

- Preserving the existing word cloud's visual identity on Main (silver breathing words + yellow highlights).
- Adding a **"View Classic"** link from V2 to V1 at `/portfolio/v1`.
- Keeping V2 fast and reliable on desktop, with a graceful CSS-3D fallback on mobile and for users who prefer reduced motion.

V1 (`/portfolio/v1`) is read-only legacy. Its source code is not modified by this work.

## 2. Non-goals

- No SSR for WebGL. `Stage` is client-only.
- No V1 redesign or V1 changes beyond the URL continuing to exist.
- No new pages under `/portfolio/*`.
- No paid / scroll-based GSAP plugins (core GSAP only).
- No audio.
- No dark-mode work for V2 (project-wide dark mode is currently disabled).
- No replacement of `framer-motion` — it stays for the dock pill `layoutId="activeTab"`.

## 3. Architecture

### 3.1 High-level layout

```
PortfolioV2Content
├── <Stage>                                  ← NEW; client-only via next/dynamic
│   ├── <Canvas dpr=[1,1.75] frameloop="demand"
│   │          gl={antialias:false, powerPreference:'high-performance'}>
│   │   └── <SceneController activePage>
│   │       ├── <CameraRig>                  ← GSAP-tweened position + lookAt
│   │       ├── <MainScene visible/>         ← hosts <WordGalaxy/>
│   │       ├── <AboutScene visible/>        ← 3D portrait card group
│   │       ├── <SkillsScene visible/>       ← instanced icon orb
│   │       ├── <ProjectsScene visible/>     ← 3D coverflow rail
│   │       └── <ContactScene visible/>      ← drei <Points/> particle field
│   └── <DOMOverlay>                         ← HTML on top of Canvas
│       └── PageContent (existing sections, slimmed down)
└── <BottomDock>                             ← existing dock + NEW "view classic" link
```

`PortfolioV2Content` calls a `useStageEnabled()` hook that returns `false` when viewport < 768px or `prefers-reduced-motion: reduce` matches. When `false`, `<Stage>` is **not rendered** — its `next/dynamic` chunk never loads. The fallback path renders the existing DOM tree (SVG word cloud + portrait image + `PageContent`) inside `PortfolioCanvas.tsx` plus a CSS-3D coverflow for Projects.

### 3.2 Key invariants

- Exactly **one `<Canvas>`** for the V2 lifetime. Sections are children that toggle `visible`; they are never unmounted.
- DOM (text, buttons, forms) is layered above WebGL (`z-30` vs `z-10`); pointer events flow through transparent areas of Canvas.
- All 3D groups share a single root `<group>` so `CameraRig` orbits a fixed origin.
- Mobile breakpoint (`<768px`) and `prefers-reduced-motion: reduce` both bypass the Canvas entirely (Stage chunk never loads) and render a DOM-only V2 with CSS-3D coverflow + the existing SVG word cloud (Tier-1 fallback).

### 3.3 Word cloud handling (Tier 2 — 3D word galaxy)

The Main word cloud moves into the same `<Canvas>` as everything else, rendered as drei `<Text>` instances on a curved spherical shell (radius ~6, front hemisphere only). The existing SVG word cloud is preserved as the mobile / reduced-motion fallback. Behaviour:

- **Breathing:** GSAP timeline drives per-word `material.opacity` waves traveling across the shell (replaces today's per-word random framer animations).
- **Highlights:** a rotating subset of words is rendered with a yellow material variant plus a soft additive-blended glow plane behind each — same identity as today's two-layer SVG cloud, just spatial. The highlight set cycles every ~4s (matches the SVG cloud's existing rhythm).
- **Leave Main:** words explode `z += 15`, opacity → 0 over ~0.7s `power2.in`, chained with camera dolly to the next section.
- **Enter Main:** words fly in from depth and settle into shell positions.
- **Idle:** very slow ambient rotation (0.02 rad/s); demand frameloop keeps GPU at 0fps when nothing is happening.
- The DOM `MainSection.tsx` (heading, glitch text, motto) stays untouched on the DOM overlay above the Canvas.

## 4. File & component layout

```
src/components/portfolio/v2/
├── PortfolioCanvas.tsx                outer wrapper (existing); injects <Stage>
├── stage/                             ← NEW
│   ├── Stage.tsx                      Canvas + DOMOverlay + ReducedMotionGuard
│   ├── SceneController.tsx            mounts all scenes; toggles `visible`
│   ├── CameraRig.tsx                  GSAP-driven camera positions per page
│   ├── scenes/
│   │   ├── MainScene.tsx              hosts <WordGalaxy/> + ambient lighting
│   │   ├── AboutScene.tsx             tilt plane w/ portrait + parallax layers
│   │   ├── SkillsScene.tsx            <InstancedMesh/> orb of icon billboards
│   │   ├── ProjectsScene.tsx          coverflow rail (3 cards visible)
│   │   └── ContactScene.tsx           drei <Points/> particle field
│   └── primitives/
│       ├── WordGalaxy.tsx             curved-shell of drei <Text/> instances
│       ├── IconBillboard.tsx
│       ├── ProjectCard3D.tsx
│       └── PortraitCard3D.tsx
├── gsap/                              ← NEW
│   ├── timelines.ts                   named timelines per page (in/out)
│   ├── usePageTimeline.ts             glue: active page → master timeline
│   └── useScrollyEntrance.ts          GSAP entrance hook for DOM overlays
├── sections/                          DOM-only after this work; animations move to gsap/
│   ├── MainSection.tsx                UNCHANGED (heading, glitch, motto)
│   ├── AboutSection.tsx               DOM copy only; GSAP-animated entrance
│   ├── SkillsSection.tsx              DOM heading + tooltip; orb is in 3D
│   ├── ProjectsSection.tsx            DOM heading + tabs + dots; cards are 3D
│   └── ContactSection.tsx             form DOM; GSAP entrance
├── shared/                            keep existing
│   ├── GoldHeading.tsx
│   ├── GoldenLayout.tsx
│   ├── PageContent.tsx
│   ├── Section.tsx
│   ├── motto.ts                       reused by WordGalaxy
│   ├── radialPacking.ts               spherical adapter added (see §6)
│   └── useComplexTransition.ts        DELETED (superseded by gsap/timelines.ts)
└── hooks/
    └── useCloudText.ts                kept for the SVG fallback path
```

**What gets deleted:** the framer-motion variants in `useComplexTransition.ts` are superseded by GSAP timelines. Per-section `motion.div` containerVariants are replaced by `useScrollyEntrance`. `framer-motion` remains a dependency (still used for the dock pill `layoutId="activeTab"`).

## 5. Per-section 3D composition

| Section | 3D content | DOM overlay | Camera preset |
|---|---|---|---|
| **Main** | `WordGalaxy` on a curved shell, plus ambient lights. Existing DOM word cloud + portrait image are removed from DOM on desktop and replaced by the 3D word galaxy; both stay on the mobile / reduced-motion fallback path. | `MainSection.tsx` (heading, glitch text, motto) unchanged | `(0, 0, 6)` looking at origin |
| **About** | `PortraitCard3D` — beveled rounded-extrude plane textured with `profilepic_faceMe`. Two depth layers behind it: blurred plane + soft-blob plane. Mouse-parallax tilt ±8°. On hover, texture cross-fades to `profilepic_faceMeEff`. | Bio, favorites pills, CV button — GSAP `from(y:30, opacity:0, stagger:0.08)` | `(-2, 0.3, 5)` — subtle off-axis dolly-in |
| **Skill** | `SkillsScene` — one billboard per `coreicon` entry (currently sized via the existing `coreicon` list in `mapdata`) packed as one `InstancedMesh` (texture atlas) on a Fibonacci sphere. Slow idle rotation (0.05 rad/s). Drag = momentum spin. Hover icon → scales 1.4×, raises toward camera; tooltip via drei `<Html/>`. Click → opens `skill.url`. | Heading + subtitle DOM only | `(0, 0, 4.5)` orbital framing |
| **Projects** | `ProjectsScene` — 3D coverflow on circular rail. Active card centred; two flanking cards rotated ±55° on Y, scaled 0.7. Card front: project image; back: title/desc/tech-stack. Click flips card (GSAP `rotateY`). Tabs (work/side) trigger a "shuffle": current set flies out, new set flies in. | Heading + work/side tabs + dot indicators DOM | `(0, 0.5, 5.5)` slight top-down tilt |
| **Contact** | `ContactScene` — drei `<Points/>` particle field (~400 particles), gold colour, slow drift toward cursor. On submit-success, GSAP burst tween (radial expand + fade). | Existing form (react-hook-form + zod), GSAP entrance | `(0, 0, 6)` static |

Camera transitions: GSAP tweens `CameraRig.position` and the `lookAt` target between presets — dolly-then-pan, ~0.9s `power3.inOut`. Reduced-motion path cuts directly between presets with no tween.

## 6. GSAP orchestration

### 6.1 Master timeline shape

`usePageTimeline(fromPage, toPage)` builds a master timeline on every page change:

```
masterTimeline
├── 0.00s  exit-DOM        (current section: y+30, opacity→0, stagger 0.04, dur 0.3)
├── 0.00s  exit-3D         (current scene's leave tween — e.g. word-galaxy explode)
├── 0.25s  camera-tween    (CameraRig pos + lookAt → next preset, power3.inOut, 0.9s)
├── 0.40s  enter-3D        (next scene's enter tween — e.g. coverflow cards fly in)
└── 0.70s  enter-DOM       (next section: y-30→0, opacity→1, stagger 0.06, dur 0.5)
```

- Every scene exposes `enter(tl, position)` + `leave(tl, position)` methods. Timeline glue is mechanical and lives in `gsap/timelines.ts`.
- Direction-aware: forward navigation (`Main → About`) uses positive Z dolly; backward uses negative — same logic as today's `getSlideDirection`.
- If the user spams the dock, `tl.kill()` jumps to the end state of the new page (no animation pile-up).
- Reduced-motion: timeline duration scales to 0 → instant cuts.

### 6.2 Hooks

- `useScrollyEntrance(ref, opts)` — mount-time GSAP `from()` for any DOM block. Used inside each section component.
- `usePageTimeline(currentPage, previousPage)` — owns the master timeline; called once in `Stage.tsx`. Returns the active timeline so components can hook into completion.

### 6.3 Why GSAP, not framer-motion

Sequencing 3D camera + 3D scene exits + DOM staggers in lockstep is GSAP's strongest territory. Framer-motion stays only for the dock pill `layoutId`.

### 6.4 Spherical word-cloud math

`radialPacking.ts` currently produces 2D positions for the SVG cloud. Add a small adapter `toSphere(packedItems, radius)` that projects 2D radial coords onto the **front hemisphere only** of a sphere of the given radius (back hemisphere is camera-occluded and skipped). The adapter does not modify the existing 2D output (still used by the SVG fallback); it produces a parallel 3D position array for `WordGalaxy`.

## 7. V1 access

A small fixed link is added to V2:

```tsx
<Link
  href="/portfolio/v1"
  className="fixed bottom-2 right-3 z-[110] text-[10px] uppercase tracking-[0.2em]
             text-stone-400 hover:text-yellow-500 transition-colors"
>
  view classic ↗
</Link>
```

- Sibling of `<BottomDock>` in `PortfolioV2Content.tsx`.
- Above dock z-index (`z-[110]` vs dock's `z-[100]`), positioned far-right so it never collides with dock pills.
- Standard Next.js `<Link>` — full client-side route, no portal animation.
- V1 page already exists at `/portfolio/v1`; no V1 internals are modified.
- No reverse "Back to V2" link is added on V1 in this scope. Users can use browser back.

## 8. Performance budget & guards

### 8.1 Hard targets

| Metric | Budget | Enforcement |
|---|---|---|
| First Contentful Paint (V2 route) | ≤ 1.5s on 4G mid-tier | Code-split: `Stage` is `next/dynamic({ ssr: false })` |
| Steady-state frame time (desktop) | ≤ 8ms (120fps headroom) | `frameloop="demand"` + invalidate on interaction/timeline |
| Steady-state frame time (mobile) | ≤ 16ms | Mobile path skips WebGL entirely (CSS-3D fallback) |
| JS bundle delta | ≤ +180kb gzipped | GSAP core only; no postfx; tree-shake drei |
| GPU memory | ≤ 80MB | One shared `MeshBasicMaterial` per scene; instanced meshes; no MSAA |

### 8.2 Mandatory perf rules

1. One Canvas, one render loop, one DPR clamp: `<Canvas dpr={[1, 1.75]} frameloop="demand" gl={{ antialias: false, powerPreference: 'high-performance' }}>`. All scenes share lighting + camera.
2. Instanced everything that repeats: 24 skill icons → 1 `InstancedMesh` (texture atlas). 50 word-galaxy words → drei `<Text/>` instances sharing one font + one material.
3. Texture discipline: all images served via existing `ImgixImage` constants (CDN-optimized). Cap textures at 1024px. Use `useTexture.preload()` at `Stage` mount.
4. Suspense boundary per scene with skeleton shimmer; never blocks initial paint.
5. `drei <Preload all />` runs once after `Stage` mounts to upload all GPU resources before the first transition.
6. Demand frameloop: scene only renders when GSAP timeline is active OR pointer is inside Canvas OR drag is in progress. Idle Main page → 0fps render.
7. Pointer events throttled to 60Hz via `lodash.throttle` (already a dep).
8. Asset disposal: each scene exposes `dispose()` for HMR safety; `useEffect` cleanup calls it. (Scenes don't unmount in prod, but HMR remounts.)
9. Mobile fallback (`<768px` OR `prefers-reduced-motion: reduce`): `Stage` returns `null`; DOM-only V2 with CSS-3D coverflow + the existing SVG word cloud (Tier-1). Same routes, same nav, no Canvas mount.
10. Bundle gates: `import gsap from 'gsap'` only — no `ScrollTrigger`, `MotionPath`, etc., unless explicitly justified later.

### 8.3 Telemetry (dev-only)

- `stats.js` mounted in dev behind `?stats=1` query param.
- Console-warn if any scene's enter/leave tween exceeds 1.2s.

### 8.4 Failure modes & guards

- WebGL context lost → re-mount Canvas once; if it fails again, fall through to mobile / CSS-3D path.
- Font load failure on word galaxy → fallback to `meshBasicMaterial` text-as-plane.
- GSAP timeline exception → `try/catch` in `usePageTimeline`, log + jump to end state of target page.

## 9. Routing summary

| Route | Status |
|---|---|
| `/portfolio` | V2, gets all upgrades |
| `/portfolio/v1` | V1, untouched |
| `/`, `/work`, `/blog`, `/admin/*` | untouched |

## 10. Testing

### 10.1 Unit (Jest + React Testing Library)

- `usePageTimeline` — mock GSAP, assert correct method calls per `from→to` combination.
- `useScrollyEntrance` — mount/unmount cleanup verified.
- `WordGalaxy` shell math — given motto words, returns expected sphere coords (snapshot of position array).

### 10.2 Visual / manual

- Storybook stories for each scene rendered in isolation inside a thin `<Canvas>` wrapper (so the user can A/B in `bun storybook`).
- Manual smoke: navigate every direction (forward, backward, jump-skip) on desktop + mobile; verify no Canvas remount, no jank, dock pill stays in sync.

### 10.3 Performance gate

- Dev-only `?stats=1` shows fps panel.
- CI does not block on perf (no Lighthouse infra in this project).

### 10.4 Reduced motion

- Manual test toggling `prefers-reduced-motion` in DevTools — verify Canvas does not mount, fallback renders, all dock navigation still works.

## 11. Open assumptions

- `gsap@3.x` will be added as a dependency; license is acceptable for personal portfolio (free for non-commercial use; double-check before any commercial deployment).
- Three.js icon atlas authored from existing `coreicon` images at build time, or runtime-once on `Stage` mount. Specific approach decided in the implementation plan.
- Existing `radialPacking.ts` logic ports cleanly to spherical coords via the `toSphere` adapter described in §6.4.

## 12. Definition of done

- `/portfolio` desktop renders the cinematic V2 with one Canvas, all five scenes, GSAP master timeline, and the "view classic" link.
- `/portfolio` on `<768px` viewports OR with `prefers-reduced-motion: reduce` renders a DOM-only V2 (CSS-3D coverflow + SVG word cloud) — no Canvas mount.
- `/portfolio/v1` continues to render the V1 portfolio with no source changes.
- Bundle delta on `/portfolio` route ≤ +180kb gzipped vs current.
- No new console errors in production build; existing tests pass; new unit tests added per §10.1 pass.
- Manual perf check: idle Main page reports 0fps when stats overlay is on.
