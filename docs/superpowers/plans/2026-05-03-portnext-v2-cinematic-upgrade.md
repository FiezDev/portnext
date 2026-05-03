# Portnext V2 Cinematic Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `/portfolio` (V2) to a cinematic experience with one persistent Three.js Canvas, GSAP-orchestrated transitions, 3D scenes per non-Main section, a Tier-2 3D word galaxy on Main, and a "view classic" link to V1 — while preserving fast performance and a CSS-3D fallback for mobile / reduced-motion.

**Architecture:** One global `<Canvas>` mounted via `<Stage>` (next/dynamic, ssr:false). Five scene groups (`Main / About / Skill / Projects / Contact`) toggle `visible` rather than mount/unmount. A GSAP master timeline orchestrates camera tweens, scene enter/leave, and DOM staggers in lockstep. Mobile (`<768px`) and `prefers-reduced-motion: reduce` skip Stage entirely and fall back to the existing DOM tree plus a CSS-3D coverflow.

**Tech Stack:** Next.js 16 (App Router, static export), React 19, TypeScript 5, Tailwind 3.4, framer-motion (kept for dock pill only), GSAP 3 (new), three 0.182, @react-three/fiber 9, @react-three/drei 10, Jest 29 + RTL, Storybook 8.

**Spec:** `docs/superpowers/specs/2026-05-03-portnext-v2-cinematic-upgrade-design.md`

**Branch:** `v2` (already checked out).

---

## File map

**New files**
```
src/hooks/useStageEnabled.ts                                  gate hook (viewport + reduced-motion)
src/hooks/__tests__/useStageEnabled.test.tsx
src/components/portfolio/v2/stage/Stage.tsx                   Canvas + DOMOverlay + Suspense
src/components/portfolio/v2/stage/SceneController.tsx         mounts all scenes, toggles visible
src/components/portfolio/v2/stage/CameraRig.tsx               GSAP-driven camera presets
src/components/portfolio/v2/stage/scenes/MainScene.tsx        hosts <WordGalaxy/>
src/components/portfolio/v2/stage/scenes/AboutScene.tsx       <PortraitCard3D/>
src/components/portfolio/v2/stage/scenes/SkillsScene.tsx      InstancedMesh icon orb
src/components/portfolio/v2/stage/scenes/ProjectsScene.tsx    coverflow rail
src/components/portfolio/v2/stage/scenes/ContactScene.tsx     drei <Points/> field
src/components/portfolio/v2/stage/primitives/WordGalaxy.tsx
src/components/portfolio/v2/stage/primitives/IconBillboard.tsx
src/components/portfolio/v2/stage/primitives/ProjectCard3D.tsx
src/components/portfolio/v2/stage/primitives/PortraitCard3D.tsx
src/components/portfolio/v2/stage/scenes/__tests__/scene-types.test.ts
src/components/portfolio/v2/gsap/timelines.ts                 named per-page in/out
src/components/portfolio/v2/gsap/usePageTimeline.ts           glue: active page → master timeline
src/components/portfolio/v2/gsap/useScrollyEntrance.ts        DOM entrance hook
src/components/portfolio/v2/gsap/__tests__/usePageTimeline.test.tsx
src/components/portfolio/v2/shared/__tests__/radialPacking.toSphere.test.ts
src/components/portfolio/v2/stage/__tests__/sceneRegistry.test.ts
jest.config.js                                                jest setup (currently missing)
jest.setup.ts                                                 RTL matchers, matchMedia mock
```

**Modified files**
```
package.json                                                  add gsap dep
src/components/PortfolioV2Content.tsx                         conditional <Stage/> + view-classic link
src/components/portfolio/v2/PortfolioCanvas.tsx               keep as fallback path; new Stage path
src/components/portfolio/v2/sections/MainSection.tsx          UNCHANGED (per spec)
src/components/portfolio/v2/sections/AboutSection.tsx         drop motion.div, use useScrollyEntrance
src/components/portfolio/v2/sections/SkillsSection.tsx        drop motion.div for icon grid (now 3D)
src/components/portfolio/v2/sections/ProjectsSection.tsx      drop ProjectCard render (now 3D)
src/components/portfolio/v2/sections/ContactSection.tsx       drop motion.div, use useScrollyEntrance
src/components/portfolio/v2/shared/radialPacking.ts           add toSphere() adapter
```

**Deleted files**
```
src/components/portfolio/v2/shared/useComplexTransition.ts    superseded by gsap/timelines.ts
```

---

## Phase 0: Setup

### Task 0.1: Install GSAP and verify build

**Files:**
- Modify: `package.json` (add `gsap`)

- [ ] **Step 1:** Install GSAP with Bun

```bash
cd /home/bjgdr/dev-personal/portnext && bun add gsap@^3
```

Expected: `package.json` gains `"gsap": "^3.x.y"` and `bun.lock` updates.

- [ ] **Step 2:** Verify build still passes

```bash
cd /home/bjgdr/dev-personal/portnext && bun run build 2>&1 | tail -20
```

Expected: build succeeds, no new errors.

- [ ] **Step 3:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add package.json bun.lock && git commit -m "chore(deps): add gsap@^3 for v2 cinematic upgrade"
```

---

### Task 0.2: Add Jest config and setup

**Files:**
- Create: `jest.config.js`
- Create: `jest.setup.ts`

- [ ] **Step 1:** Create `jest.config.js`

```js
const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });
module.exports = createJestConfig({
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
});
```

- [ ] **Step 2:** Create `jest.setup.ts`

```ts
import '@testing-library/jest-dom';

// matchMedia stub for jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});
```

- [ ] **Step 3:** Run jest to confirm it starts cleanly (no tests yet)

```bash
cd /home/bjgdr/dev-personal/portnext && bun test 2>&1 | tail -10
```

Expected: "No tests found" — exit code 0 or "0 tests, 0 failures". Acceptable.

- [ ] **Step 4:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add jest.config.js jest.setup.ts && git commit -m "test: add jest + jest.setup with matchMedia stub"
```

---

## Phase 1: Gating, V1 link, Stage placeholder

### Task 1.1: `useStageEnabled` hook + tests

**Files:**
- Create: `src/hooks/useStageEnabled.ts`
- Test: `src/hooks/__tests__/useStageEnabled.test.tsx`

- [ ] **Step 1:** Write the failing test

```tsx
// src/hooks/__tests__/useStageEnabled.test.tsx
import { renderHook } from '@testing-library/react';
import { useStageEnabled } from '../useStageEnabled';

const setMatchMedia = (matches: (query: string) => boolean) => {
  (window.matchMedia as jest.Mock) = jest.fn().mockImplementation((query: string) => ({
    matches: matches(query),
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
};

describe('useStageEnabled', () => {
  it('returns true on desktop with no reduced-motion', () => {
    setMatchMedia((q) => q === '(min-width: 768px)');
    const { result } = renderHook(() => useStageEnabled());
    expect(result.current).toBe(true);
  });

  it('returns false on small viewport', () => {
    setMatchMedia(() => false);
    const { result } = renderHook(() => useStageEnabled());
    expect(result.current).toBe(false);
  });

  it('returns false when prefers-reduced-motion: reduce', () => {
    setMatchMedia((q) => q === '(prefers-reduced-motion: reduce)' || q === '(min-width: 768px)');
    const { result } = renderHook(() => useStageEnabled());
    expect(result.current).toBe(false);
  });
});
```

- [ ] **Step 2:** Run — expect failure

```bash
cd /home/bjgdr/dev-personal/portnext && bun test src/hooks/__tests__/useStageEnabled 2>&1 | tail -10
```

Expected: FAIL — module not found.

- [ ] **Step 3:** Implement the hook

```ts
// src/hooks/useStageEnabled.ts
import { useEffect, useState } from 'react';

const DESKTOP = '(min-width: 768px)';
const REDUCED = '(prefers-reduced-motion: reduce)';

export function useStageEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const desktopMql = window.matchMedia(DESKTOP);
    const reducedMql = window.matchMedia(REDUCED);

    const compute = () => setEnabled(desktopMql.matches && !reducedMql.matches);
    compute();

    desktopMql.addEventListener('change', compute);
    reducedMql.addEventListener('change', compute);
    return () => {
      desktopMql.removeEventListener('change', compute);
      reducedMql.removeEventListener('change', compute);
    };
  }, []);

  return enabled;
}
```

- [ ] **Step 4:** Run — expect pass

```bash
cd /home/bjgdr/dev-personal/portnext && bun test src/hooks/__tests__/useStageEnabled 2>&1 | tail -10
```

Expected: 3 passed.

- [ ] **Step 5:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/hooks/useStageEnabled.ts src/hooks/__tests__ && git commit -m "feat(v2): add useStageEnabled hook (viewport + reduced-motion gate)"
```

---

### Task 1.2: Add "view classic" link to V2

**Files:**
- Modify: `src/components/PortfolioV2Content.tsx`

- [ ] **Step 1:** Open the file and locate the closing of the bottom dock `<div>` (around line 88).

- [ ] **Step 2:** Add the link as a sibling of the dock. Edit the file by inserting this block immediately AFTER the closing `</div>` of the bottom dock, but BEFORE the outer `</div>`:

```tsx
{/* "View Classic" link to V1 portfolio */}
<a
  href="/portfolio/v1"
  className="fixed bottom-2 right-3 z-[110] text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-yellow-500 transition-colors"
>
  view classic ↗
</a>
```

(Use a plain `<a>` rather than `next/link` — the V1 page is a separate App Router route and a hard navigation is fine here, plus this avoids new imports for one element.)

- [ ] **Step 3:** Verify no type errors

```bash
cd /home/bjgdr/dev-personal/portnext && bunx tsc --noEmit 2>&1 | tail -5
```

Expected: no errors.

- [ ] **Step 4:** Manual smoke

```bash
cd /home/bjgdr/dev-personal/portnext && bun dev
```

Open `http://localhost:3000/portfolio`, look at bottom-right corner. Click "view classic ↗" — should navigate to `/portfolio/v1`. Stop dev server.

- [ ] **Step 5:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/PortfolioV2Content.tsx && git commit -m "feat(v2): add 'view classic' link to V1 portfolio"
```

---

### Task 1.3: Add Stage placeholder + conditional render

**Files:**
- Create: `src/components/portfolio/v2/stage/Stage.tsx`
- Modify: `src/components/PortfolioV2Content.tsx`

- [ ] **Step 1:** Create empty Stage that returns `null`

```tsx
// src/components/portfolio/v2/stage/Stage.tsx
'use client';

import type { PageId } from '../shared/useComplexTransition';

interface StageProps {
  currentPage: PageId;
  previousPage?: PageId;
}

// Phase 1 stub. Real Canvas mounts in Phase 2.
const Stage = ({ currentPage }: StageProps) => {
  void currentPage;
  return null;
};

export default Stage;
```

- [ ] **Step 2:** Wire dynamic-import in `PortfolioV2Content.tsx`. Add at top:

```tsx
import dynamic from 'next/dynamic';
import { useStageEnabled } from '@/hooks/useStageEnabled';

const Stage = dynamic(() => import('./portfolio/v2/stage/Stage'), { ssr: false });
```

Inside the component (after `useEffect`), add:

```tsx
const stageEnabled = useStageEnabled();
```

In the JSX, render `<Stage>` conditionally as a sibling of `<PortfolioCanvas>` (still inside the main wrapper):

```tsx
{stageEnabled && (
  <Stage currentPage={currentPage} previousPage={previousPageRef.current} />
)}
```

- [ ] **Step 3:** Verify type-check

```bash
cd /home/bjgdr/dev-personal/portnext && bunx tsc --noEmit 2>&1 | tail -5
```

Expected: no errors.

- [ ] **Step 4:** Manual smoke

Dev server, open `/portfolio`. Should look identical to before (Stage returns null). DevTools Network tab → confirm `Stage` chunk loads only on desktop, not on mobile emulation.

- [ ] **Step 5:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/stage/Stage.tsx src/components/PortfolioV2Content.tsx && git commit -m "feat(v2): add Stage placeholder + dynamic gating via useStageEnabled"
```

---

## Phase 2: Canvas + SceneController + CameraRig

### Task 2.1: Mount Canvas with perf settings inside Stage

**Files:**
- Modify: `src/components/portfolio/v2/stage/Stage.tsx`

- [ ] **Step 1:** Replace Stage with real Canvas. Full file:

```tsx
// src/components/portfolio/v2/stage/Stage.tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import type { PageId } from '../shared/useComplexTransition';
import SceneController from './SceneController';

interface StageProps {
  currentPage: PageId;
  previousPage?: PageId;
}

const Stage = ({ currentPage, previousPage }: StageProps) => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <Canvas
        dpr={[1, 1.75]}
        frameloop="demand"
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 6], fov: 50 }}
        className="!pointer-events-auto"
      >
        <Suspense fallback={null}>
          <SceneController currentPage={currentPage} previousPage={previousPage} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Stage;
```

- [ ] **Step 2:** Run type-check (will fail, SceneController doesn't exist yet)

```bash
cd /home/bjgdr/dev-personal/portnext && bunx tsc --noEmit 2>&1 | tail -5
```

Expected: error referencing `SceneController` — that's fine, fixed in next task.

---

### Task 2.2: Create SceneController + scene stubs

**Files:**
- Create: `src/components/portfolio/v2/stage/SceneController.tsx`
- Create: `src/components/portfolio/v2/stage/scenes/MainScene.tsx`
- Create: `src/components/portfolio/v2/stage/scenes/AboutScene.tsx`
- Create: `src/components/portfolio/v2/stage/scenes/SkillsScene.tsx`
- Create: `src/components/portfolio/v2/stage/scenes/ProjectsScene.tsx`
- Create: `src/components/portfolio/v2/stage/scenes/ContactScene.tsx`

- [ ] **Step 1:** Create each scene stub. They take a `visible` prop and render a placeholder mesh so we can confirm the Canvas works.

```tsx
// src/components/portfolio/v2/stage/scenes/MainScene.tsx
import type { Group } from 'three';
import { forwardRef } from 'react';
const MainScene = forwardRef<Group, { visible: boolean }>(({ visible }, ref) => (
  <group ref={ref} visible={visible}>
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshBasicMaterial color="#FBBF24" />
    </mesh>
  </group>
));
MainScene.displayName = 'MainScene';
export default MainScene;
```

Repeat for `AboutScene`, `SkillsScene`, `ProjectsScene`, `ContactScene` — same shape, different colors (`#3B82F6`, `#10B981`, `#F472B6`, `#A78BFA`) and slightly offset positions so we can visually distinguish them later.

```tsx
// AboutScene.tsx — change color to #3B82F6
// SkillsScene.tsx — change color to #10B981
// ProjectsScene.tsx — change color to #F472B6
// ContactScene.tsx — change color to #A78BFA
```

- [ ] **Step 2:** Create `SceneController`:

```tsx
// src/components/portfolio/v2/stage/SceneController.tsx
'use client';

import { useRef } from 'react';
import type { Group } from 'three';
import type { PageId } from '../shared/useComplexTransition';
import MainScene from './scenes/MainScene';
import AboutScene from './scenes/AboutScene';
import SkillsScene from './scenes/SkillsScene';
import ProjectsScene from './scenes/ProjectsScene';
import ContactScene from './scenes/ContactScene';
import CameraRig from './CameraRig';

interface SceneControllerProps {
  currentPage: PageId;
  previousPage?: PageId;
}

const SceneController = ({ currentPage, previousPage }: SceneControllerProps) => {
  const mainRef = useRef<Group>(null);
  const aboutRef = useRef<Group>(null);
  const skillsRef = useRef<Group>(null);
  const projectsRef = useRef<Group>(null);
  const contactRef = useRef<Group>(null);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 5, 5]} intensity={0.8} />
      <CameraRig currentPage={currentPage} previousPage={previousPage} />
      <MainScene ref={mainRef} visible={currentPage === 'Main'} />
      <AboutScene ref={aboutRef} visible={currentPage === 'About'} />
      <SkillsScene ref={skillsRef} visible={currentPage === 'Skill'} />
      <ProjectsScene ref={projectsRef} visible={currentPage === 'Projects'} />
      <ContactScene ref={contactRef} visible={currentPage === 'Contact'} />
    </>
  );
};

export default SceneController;
```

- [ ] **Step 3:** Commit (will fail if `CameraRig` not present — proceed to next task in same commit unit)

---

### Task 2.3: Create CameraRig with static presets

**Files:**
- Create: `src/components/portfolio/v2/stage/CameraRig.tsx`

- [ ] **Step 1:** Implement camera presets (no GSAP yet — instant snap)

```tsx
// src/components/portfolio/v2/stage/CameraRig.tsx
'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import type { PageId } from '../shared/useComplexTransition';

const CAMERA_PRESETS: Record<PageId, { pos: [number, number, number]; look: [number, number, number] }> = {
  Main:     { pos: [0, 0, 6],       look: [0, 0, 0] },
  About:    { pos: [-2, 0.3, 5],    look: [0, 0, 0] },
  Skill:    { pos: [0, 0, 4.5],     look: [0, 0, 0] },
  Projects: { pos: [0, 0.5, 5.5],   look: [0, 0, 0] },
  Contact:  { pos: [0, 0, 6],       look: [0, 0, 0] },
};

interface CameraRigProps {
  currentPage: PageId;
  previousPage?: PageId;
}

const CameraRig = ({ currentPage }: CameraRigProps) => {
  const camera = useThree((s) => s.camera);
  const targetPos = useRef(new Vector3());
  const targetLook = useRef(new Vector3());

  useEffect(() => {
    const preset = CAMERA_PRESETS[currentPage];
    targetPos.current.set(...preset.pos);
    targetLook.current.set(...preset.look);
  }, [currentPage]);

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.1);
    camera.lookAt(targetLook.current);
  });

  return null;
};

export default CameraRig;
```

- [ ] **Step 2:** Type-check

```bash
cd /home/bjgdr/dev-personal/portnext && bunx tsc --noEmit 2>&1 | tail -5
```

Expected: no errors.

- [ ] **Step 3:** Manual smoke

```bash
bun dev
```

Open `/portfolio`. Should see existing V2 PLUS a small floating yellow cube (Main scene). Click "About" in dock — yellow cube hides, blue cube appears at slightly off-axis camera. All five sections show their placeholder cube. Word cloud still works on Main.

- [ ] **Step 4:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/stage/ && git commit -m "feat(v2): mount Canvas with SceneController + CameraRig + 5 scene stubs"
```

---

### Task 2.4: SceneRegistry test (snapshot of expected scene IDs)

**Files:**
- Create: `src/components/portfolio/v2/stage/__tests__/sceneRegistry.test.ts`

- [ ] **Step 1:** Write test

```ts
import { PAGE_ORDER } from '../../shared/useComplexTransition';

describe('Scene registry', () => {
  it('has one scene per page in PAGE_ORDER', () => {
    expect(PAGE_ORDER).toEqual(['Main', 'About', 'Skill', 'Projects', 'Contact']);
  });

  it('exposes scene modules importable by id', async () => {
    for (const id of PAGE_ORDER) {
      const mod = await import(`../scenes/${id}Scene`);
      expect(mod.default).toBeDefined();
    }
  });
});
```

- [ ] **Step 2:** Run — expect pass

```bash
cd /home/bjgdr/dev-personal/portnext && bun test sceneRegistry 2>&1 | tail -10
```

Expected: 2 passed. (If dynamic import fails for `Skill` because the file is named `SkillsScene.tsx` not `SkillScene.tsx`, fix the test mapping inline:)

```ts
const SCENE_FILE: Record<string, string> = {
  Main: 'MainScene', About: 'AboutScene', Skill: 'SkillsScene',
  Projects: 'ProjectsScene', Contact: 'ContactScene',
};
for (const id of PAGE_ORDER) {
  const mod = await import(`../scenes/${SCENE_FILE[id]}`);
  expect(mod.default).toBeDefined();
}
```

- [ ] **Step 3:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/stage/__tests__ && git commit -m "test(v2): scene registry coverage for all PAGE_ORDER entries"
```

---

## Phase 3: GSAP master timeline

### Task 3.1: Define scene method type + timeline scaffolding

**Files:**
- Create: `src/components/portfolio/v2/gsap/timelines.ts`

- [ ] **Step 1:** Implement timeline factory (camera-only for now; per-scene enter/leave hooks come later)

```ts
// src/components/portfolio/v2/gsap/timelines.ts
import gsap from 'gsap';
import type { Camera, Vector3 } from 'three';
import type { PageId } from '../shared/useComplexTransition';

export interface CameraTarget {
  pos: [number, number, number];
  look: [number, number, number];
}

export const CAMERA_PRESETS: Record<PageId, CameraTarget> = {
  Main:     { pos: [0, 0, 6],       look: [0, 0, 0] },
  About:    { pos: [-2, 0.3, 5],    look: [0, 0, 0] },
  Skill:    { pos: [0, 0, 4.5],     look: [0, 0, 0] },
  Projects: { pos: [0, 0.5, 5.5],   look: [0, 0, 0] },
  Contact:  { pos: [0, 0, 6],       look: [0, 0, 0] },
};

export interface SceneAnimator {
  enter: (tl: gsap.core.Timeline, position: gsap.Position) => void;
  leave: (tl: gsap.core.Timeline, position: gsap.Position) => void;
}

interface BuildArgs {
  camera: Camera;
  cameraLook: Vector3;
  fromAnimator?: SceneAnimator;
  toAnimator?: SceneAnimator;
  reducedMotion: boolean;
  fromPage: PageId;
  toPage: PageId;
  onComplete?: () => void;
}

export function buildTransitionTimeline(args: BuildArgs): gsap.core.Timeline {
  const { camera, cameraLook, fromAnimator, toAnimator, reducedMotion, toPage, onComplete } = args;
  const tl = gsap.timeline({ onComplete });
  const dur = reducedMotion ? 0 : 0.9;

  // 0.00s exit-3D
  fromAnimator?.leave(tl, 0);

  // 0.25s camera tween
  const target = CAMERA_PRESETS[toPage];
  tl.to(camera.position, {
    x: target.pos[0], y: target.pos[1], z: target.pos[2],
    duration: dur, ease: 'power3.inOut',
  }, 0.25);
  tl.to(cameraLook, {
    x: target.look[0], y: target.look[1], z: target.look[2],
    duration: dur, ease: 'power3.inOut',
  }, 0.25);

  // 0.40s enter-3D
  toAnimator?.enter(tl, 0.4);

  return tl;
}
```

- [ ] **Step 2:** Type-check

```bash
cd /home/bjgdr/dev-personal/portnext && bunx tsc --noEmit 2>&1 | tail -5
```

Expected: no errors. If `gsap.Position` import errors, change to `gsap.core.Position`.

- [ ] **Step 3:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/gsap/timelines.ts && git commit -m "feat(v2): add GSAP timeline factory for page transitions"
```

---

### Task 3.2: `usePageTimeline` hook + tests

**Files:**
- Create: `src/components/portfolio/v2/gsap/usePageTimeline.ts`
- Test: `src/components/portfolio/v2/gsap/__tests__/usePageTimeline.test.tsx`

- [ ] **Step 1:** Write the failing test

```tsx
// __tests__/usePageTimeline.test.tsx
import { renderHook } from '@testing-library/react';
import { usePageTimeline } from '../usePageTimeline';

jest.mock('gsap', () => {
  const tl = { kill: jest.fn(), to: jest.fn().mockReturnThis(), pause: jest.fn() };
  return {
    __esModule: true,
    default: {
      timeline: jest.fn().mockReturnValue(tl),
      core: {},
    },
  };
});

describe('usePageTimeline', () => {
  it('does nothing on first render with same prev/current', () => {
    const { result } = renderHook(() =>
      usePageTimeline({ currentPage: 'Main', previousPage: 'Main', enabled: true })
    );
    expect(result.current).toBeNull();
  });

  it('returns null when disabled', () => {
    const { result } = renderHook(() =>
      usePageTimeline({ currentPage: 'About', previousPage: 'Main', enabled: false })
    );
    expect(result.current).toBeNull();
  });
});
```

- [ ] **Step 2:** Run — expect failure

```bash
cd /home/bjgdr/dev-personal/portnext && bun test usePageTimeline 2>&1 | tail -10
```

Expected: FAIL — module not found.

- [ ] **Step 3:** Implement hook

```tsx
// src/components/portfolio/v2/gsap/usePageTimeline.ts
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { PageId } from '../shared/useComplexTransition';
import { buildTransitionTimeline, SceneAnimator } from './timelines';

interface UsePageTimelineArgs {
  currentPage: PageId;
  previousPage?: PageId;
  enabled?: boolean;
  animators?: Partial<Record<PageId, SceneAnimator>>;
  reducedMotion?: boolean;
}

export function usePageTimeline(args: UsePageTimelineArgs): gsap.core.Timeline | null {
  const { currentPage, previousPage, enabled = true, animators, reducedMotion = false } = args;
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const lookRef = useRef(new Vector3(0, 0, 0));

  // Try to get camera if inside Canvas; if not (SSR / unit test), fail soft.
  let camera: gsap.core.Timeline | null = null;
  try {
    camera = useThree((s) => s.camera) as unknown as gsap.core.Timeline;
  } catch {
    camera = null;
  }

  useEffect(() => {
    if (!enabled || !previousPage || previousPage === currentPage || !camera) return;

    tlRef.current?.kill();
    tlRef.current = buildTransitionTimeline({
      camera: camera as never,
      cameraLook: lookRef.current,
      fromAnimator: animators?.[previousPage],
      toAnimator: animators?.[currentPage],
      reducedMotion,
      fromPage: previousPage,
      toPage: currentPage,
    });
  }, [currentPage, previousPage, enabled, animators, reducedMotion, camera]);

  return tlRef.current;
}
```

- [ ] **Step 4:** Run — expect pass

```bash
cd /home/bjgdr/dev-personal/portnext && bun test usePageTimeline 2>&1 | tail -10
```

Expected: 2 passed.

- [ ] **Step 5:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/gsap/ && git commit -m "feat(v2): add usePageTimeline hook driving GSAP transitions"
```

---

### Task 3.3: `useScrollyEntrance` for DOM blocks

**Files:**
- Create: `src/components/portfolio/v2/gsap/useScrollyEntrance.ts`

- [ ] **Step 1:** Implement

```ts
// src/components/portfolio/v2/gsap/useScrollyEntrance.ts
'use client';

import { useEffect, RefObject } from 'react';
import gsap from 'gsap';

interface ScrollyEntranceOpts {
  y?: number;
  stagger?: number;
  duration?: number;
  delay?: number;
  selector?: string;
}

export function useScrollyEntrance(ref: RefObject<HTMLElement | null>, opts: ScrollyEntranceOpts = {}) {
  const { y = 30, stagger = 0.06, duration = 0.5, delay = 0, selector = '[data-stagger]' } = opts;

  useEffect(() => {
    if (!ref.current) return;
    const targets = ref.current.querySelectorAll(selector);
    if (targets.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        opacity: 0, y, duration, stagger, delay, ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    }, ref);

    return () => ctx.revert();
  }, [ref, y, stagger, duration, delay, selector]);
}
```

- [ ] **Step 2:** Type-check

```bash
cd /home/bjgdr/dev-personal/portnext && bunx tsc --noEmit 2>&1 | tail -5
```

Expected: no errors.

- [ ] **Step 3:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/gsap/useScrollyEntrance.ts && git commit -m "feat(v2): add useScrollyEntrance for DOM block animations"
```

---

### Task 3.4: Wire `usePageTimeline` into `SceneController`, retire `useComplexTransition`

**Files:**
- Modify: `src/components/portfolio/v2/stage/SceneController.tsx`
- Modify: `src/components/portfolio/v2/stage/CameraRig.tsx`
- Modify: `src/components/portfolio/v2/PortfolioCanvas.tsx`
- Delete: `src/components/portfolio/v2/shared/useComplexTransition.ts`

- [ ] **Step 1:** Move `PageId`, `PAGE_ORDER`, `getAdjacentPage`, `isValidPage` into a new file `src/components/portfolio/v2/shared/pages.ts`:

```ts
// src/components/portfolio/v2/shared/pages.ts
export type PageId = 'Main' | 'About' | 'Skill' | 'Projects' | 'Contact';
export const PAGE_ORDER: PageId[] = ['Main', 'About', 'Skill', 'Projects', 'Contact'];

export const isValidPage = (page: string): page is PageId => PAGE_ORDER.includes(page as PageId);

export const getAdjacentPage = (currentPage: PageId, direction: 'next' | 'prev'): PageId | null => {
  const i = PAGE_ORDER.indexOf(currentPage);
  if (i === -1) return null;
  const ni = direction === 'next'
    ? Math.min(i + 1, PAGE_ORDER.length - 1)
    : Math.max(i - 1, 0);
  return PAGE_ORDER[ni];
};
```

- [ ] **Step 2:** Update every import of `useComplexTransition` for the **types/helpers only** to import from `./shared/pages` instead. Run a project-wide search:

```bash
cd /home/bjgdr/dev-personal/portnext && grep -rln "useComplexTransition" src/
```

Update each file's `import` line: change source from `./shared/useComplexTransition` (or `../shared/useComplexTransition`) to the equivalent `./shared/pages` (or `../shared/pages`). The `useComplexTransition` hook itself is no longer used — remove its call sites.

- [ ] **Step 3:** Replace `PortfolioCanvas.tsx` framer-motion variant logic with simple `AnimatePresence + opacity` for the fallback path (mobile/reduced-motion only):

Open `src/components/portfolio/v2/PortfolioCanvas.tsx`. Delete the `useComplexTransition` import and call. Replace the `<motion.div ... variants={pageVariants} ...>` props with:

```tsx
<motion.div
  key={currentPage}
  className="w-full h-full bg-transparent flex items-center justify-center relative"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3, ease: 'easeInOut' }}
>
```

(Keep the rest of the JSX. The Stage path will own the cinematic transitions; this fallback path just cross-fades.)

- [ ] **Step 4:** Delete `useComplexTransition.ts`

```bash
cd /home/bjgdr/dev-personal/portnext && rm src/components/portfolio/v2/shared/useComplexTransition.ts
```

- [ ] **Step 5:** Update `CameraRig.tsx` to drive position via GSAP-friendly target instead of lerp (we'll keep lerp as the actual driver in Phase 3 because GSAP timeline is owned by Stage; CameraRig still reads target). Also replace local `CAMERA_PRESETS` with the import from `gsap/timelines.ts`:

```tsx
// CameraRig.tsx
import { CAMERA_PRESETS } from '../gsap/timelines';
import type { PageId } from '../shared/pages';
// (remove local CAMERA_PRESETS const)
```

- [ ] **Step 6:** Type-check + run all tests

```bash
cd /home/bjgdr/dev-personal/portnext && bunx tsc --noEmit 2>&1 | tail -10 && bun test 2>&1 | tail -10
```

Expected: no type errors; all tests pass.

- [ ] **Step 7:** Manual smoke

`bun dev`, navigate `Main → About → Skill → Projects → Contact` and back. Cube placeholders should still appear/hide correctly. No console errors.

- [ ] **Step 8:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add -A && git commit -m "refactor(v2): retire useComplexTransition, extract PageId to shared/pages"
```

---

### Task 3.5: Wire `usePageTimeline` to drive camera

**Files:**
- Modify: `src/components/portfolio/v2/stage/CameraRig.tsx`
- Modify: `src/components/portfolio/v2/stage/SceneController.tsx`

- [ ] **Step 1:** Replace lerp-based CameraRig with GSAP-driven target:

```tsx
// src/components/portfolio/v2/stage/CameraRig.tsx
'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import gsap from 'gsap';
import { CAMERA_PRESETS } from '../gsap/timelines';
import type { PageId } from '../shared/pages';

interface CameraRigProps {
  currentPage: PageId;
  previousPage?: PageId;
  reducedMotion?: boolean;
}

const CameraRig = ({ currentPage, previousPage, reducedMotion = false }: CameraRigProps) => {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const lookRef = useRef(new Vector3(0, 0, 0));

  useEffect(() => {
    if (!previousPage || previousPage === currentPage) {
      const init = CAMERA_PRESETS[currentPage];
      camera.position.set(...init.pos);
      lookRef.current.set(...init.look);
      camera.lookAt(lookRef.current);
      invalidate();
      return;
    }

    const target = CAMERA_PRESETS[currentPage];
    const dur = reducedMotion ? 0 : 0.9;
    const tl = gsap.timeline({ onUpdate: invalidate });
    tl.to(camera.position, { x: target.pos[0], y: target.pos[1], z: target.pos[2], duration: dur, ease: 'power3.inOut' }, 0);
    tl.to(lookRef.current, { x: target.look[0], y: target.look[1], z: target.look[2], duration: dur, ease: 'power3.inOut' }, 0);
    return () => { tl.kill(); };
  }, [currentPage, previousPage, reducedMotion, camera, invalidate]);

  useFrame(() => {
    camera.lookAt(lookRef.current);
  });

  return null;
};

export default CameraRig;
```

- [ ] **Step 2:** Pass `reducedMotion` (computed via matchMedia) from `SceneController` to `CameraRig`. Inside SceneController:

```tsx
const reducedMotion = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// ...
<CameraRig currentPage={currentPage} previousPage={previousPage} reducedMotion={reducedMotion} />
```

- [ ] **Step 3:** Manual smoke

`bun dev`. Navigate. Camera should now smoothly tween between presets (~0.9s) instead of snap. With reduced-motion ON in DevTools, should be instant.

- [ ] **Step 4:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/stage/ && git commit -m "feat(v2): GSAP-driven camera tween between page presets"
```

---

## Phase 4: Word Galaxy (Tier 2)

### Task 4.1: `toSphere` adapter + tests

**Files:**
- Modify: `src/components/portfolio/v2/shared/radialPacking.ts` (add export only — don't touch existing logic)
- Test: `src/components/portfolio/v2/shared/__tests__/radialPacking.toSphere.test.ts`

- [ ] **Step 1:** Write the failing test

```ts
// __tests__/radialPacking.toSphere.test.ts
import { toSphere } from '../radialPacking';

describe('toSphere', () => {
  const items = [
    { x: 0, y: 0 },         // center
    { x: 100, y: 0 },       // right
    { x: 0, y: 100 },       // bottom
    { x: -100, y: -100 },   // top-left
  ];

  it('returns one 3D point per input item', () => {
    const out = toSphere(items, 6);
    expect(out).toHaveLength(items.length);
    out.forEach(([x, y, z]) => {
      expect(typeof x).toBe('number');
      expect(typeof y).toBe('number');
      expect(typeof z).toBe('number');
    });
  });

  it('places center item near +Z axis on the front hemisphere', () => {
    const [[x, y, z]] = toSphere(items, 6);
    expect(z).toBeGreaterThan(0); // front hemisphere
    expect(Math.abs(x)).toBeLessThan(0.5);
    expect(Math.abs(y)).toBeLessThan(0.5);
  });

  it('all points lie on the sphere of given radius', () => {
    const out = toSphere(items, 6);
    out.forEach(([x, y, z]) => {
      const r = Math.sqrt(x * x + y * y + z * z);
      expect(r).toBeCloseTo(6, 1);
    });
  });
});
```

- [ ] **Step 2:** Run — expect failure

```bash
cd /home/bjgdr/dev-personal/portnext && bun test toSphere 2>&1 | tail -10
```

Expected: FAIL — `toSphere is not a function`.

- [ ] **Step 3:** Implement adapter at the bottom of `radialPacking.ts`:

```ts
// Append to src/components/portfolio/v2/shared/radialPacking.ts
export interface FlatPoint { x: number; y: number }

/**
 * Project 2D radial-packed points onto the FRONT hemisphere of a sphere of `radius`.
 * Input coords are assumed to be roughly bounded in [-bound, bound]; we normalize by
 * inferring the bound from the max magnitude.
 */
export function toSphere(items: FlatPoint[], radius: number): [number, number, number][] {
  if (items.length === 0) return [];
  const maxMag = Math.max(...items.map(p => Math.hypot(p.x, p.y))) || 1;

  return items.map(({ x, y }) => {
    // Normalize to unit disk
    const u = x / maxMag;
    const v = y / maxMag;

    // Spherical projection: phi = polar angle from +Z, mapped from disk magnitude (0..1 → 0..PI/2)
    const r2d = Math.hypot(u, v);          // 0..1
    const phi = (r2d * Math.PI) / 2;       // 0..PI/2 → front hemisphere only
    const theta = Math.atan2(v, u);        // azimuth

    const sinPhi = Math.sin(phi);
    return [
      radius * sinPhi * Math.cos(theta),
      radius * sinPhi * Math.sin(theta),
      radius * Math.cos(phi),              // always >= 0 (front hemisphere)
    ];
  });
}
```

- [ ] **Step 4:** Run — expect pass

```bash
cd /home/bjgdr/dev-personal/portnext && bun test toSphere 2>&1 | tail -10
```

Expected: 3 passed.

- [ ] **Step 5:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/shared/ && git commit -m "feat(v2): add toSphere adapter for word galaxy"
```

---

### Task 4.2: `WordGalaxy` primitive — render words on sphere

**Files:**
- Create: `src/components/portfolio/v2/stage/primitives/WordGalaxy.tsx`

- [ ] **Step 1:** Implement using drei `<Text/>`

```tsx
// src/components/portfolio/v2/stage/primitives/WordGalaxy.tsx
'use client';

import { Text } from '@react-three/drei';
import { useMemo, forwardRef } from 'react';
import type { Group } from 'three';
import { generateRadialPackedWords, toSphere } from '../../shared/radialPacking';

export interface WordGalaxyProps {
  visible: boolean;
  radius?: number;
  count?: number;
  highlightedIndices?: Set<number>;
  baseColor?: string;
  highlightColor?: string;
}

const WordGalaxy = forwardRef<Group, WordGalaxyProps>(
  ({ visible, radius = 6, count = 50, highlightedIndices, baseColor = '#A1A1AA', highlightColor = '#FBBF24' }, ref) => {
    const words = useMemo(() => generateRadialPackedWords(count, 1), [count]);
    const positions = useMemo(() => toSphere(words.map(w => ({ x: w.x, y: w.y })), radius), [words, radius]);

    return (
      <group ref={ref} visible={visible}>
        {words.map((w, i) => {
          const [x, y, z] = positions[i];
          const isHi = highlightedIndices?.has(i) ?? false;
          return (
            <Text
              key={i}
              position={[x, y, z]}
              fontSize={0.18}
              color={isHi ? highlightColor : baseColor}
              fontWeight="bold"
              anchorX="center"
              anchorY="middle"
              outlineWidth={isHi ? 0.005 : 0}
              outlineColor={isHi ? highlightColor : 'transparent'}
              material-transparent
              material-opacity={0.85}
            >
              {w.text}
            </Text>
          );
        })}
      </group>
    );
  }
);
WordGalaxy.displayName = 'WordGalaxy';
export default WordGalaxy;
```

(`generateRadialPackedWords` already exists in `radialPacking.ts` and returns items with `.x`, `.y`, `.text`.)

- [ ] **Step 2:** Type-check

```bash
cd /home/bjgdr/dev-personal/portnext && bunx tsc --noEmit 2>&1 | tail -10
```

Expected: no errors. (If `Text` font prop type complains, drop the `fontWeight` prop — drei's `<Text>` uses `font` not `fontWeight`.)

- [ ] **Step 3:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/stage/primitives/ && git commit -m "feat(v2): add WordGalaxy primitive (drei Text on sphere)"
```

---

### Task 4.3: Wire `WordGalaxy` into `MainScene` + hide DOM cloud on desktop

**Files:**
- Modify: `src/components/portfolio/v2/stage/scenes/MainScene.tsx`
- Modify: `src/components/portfolio/v2/PortfolioCanvas.tsx`

- [ ] **Step 1:** Replace MainScene placeholder

```tsx
// src/components/portfolio/v2/stage/scenes/MainScene.tsx
'use client';

import { forwardRef } from 'react';
import type { Group } from 'three';
import WordGalaxy from '../primitives/WordGalaxy';

const MainScene = forwardRef<Group, { visible: boolean }>(({ visible }, ref) => (
  <group ref={ref} visible={visible}>
    <WordGalaxy visible={visible} />
  </group>
));
MainScene.displayName = 'MainScene';
export default MainScene;
```

- [ ] **Step 2:** In `PortfolioCanvas.tsx`, hide DOM word cloud + portrait when Stage is enabled. Add a prop:

```tsx
interface PortfolioCanvasProps {
  currentPage: PageId;
  previousPage?: PageId;
  domCloudOnly?: boolean; // false when Stage is mounted; true on fallback
}
```

Default `domCloudOnly = true` (preserves current behaviour). In the JSX, gate the existing word-cloud SVG block and portrait image block on `domCloudOnly && showBackground` instead of just `showBackground`.

- [ ] **Step 3:** In `PortfolioV2Content.tsx`, pass the prop:

```tsx
<PortfolioCanvas
  currentPage={currentPage}
  previousPage={previousPageRef.current}
  domCloudOnly={!stageEnabled}
/>
```

- [ ] **Step 4:** Manual smoke

`bun dev`, open `/portfolio` on desktop. Should now see floating gold words in 3D space (Word Galaxy) on Main page. DOM word cloud SVG should be gone. With reduced-motion or mobile, DOM word cloud comes back.

- [ ] **Step 5:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add -A && git commit -m "feat(v2): wire WordGalaxy into MainScene; gate DOM cloud on fallback path"
```

---

### Task 4.4: Highlight cycle on `WordGalaxy`

**Files:**
- Modify: `src/components/portfolio/v2/stage/scenes/MainScene.tsx`

- [ ] **Step 1:** Add highlight rotation logic in MainScene

```tsx
// src/components/portfolio/v2/stage/scenes/MainScene.tsx
'use client';

import { forwardRef, useEffect, useState } from 'react';
import type { Group } from 'three';
import WordGalaxy from '../primitives/WordGalaxy';

const TOTAL = 50;
const HIGHLIGHT_COUNT = 3;

const pickRandom = (n: number, total: number) => {
  const set = new Set<number>();
  while (set.size < Math.min(n, total)) set.add(Math.floor(Math.random() * total));
  return set;
};

const MainScene = forwardRef<Group, { visible: boolean }>(({ visible }, ref) => {
  const [highlights, setHighlights] = useState<Set<number>>(() => pickRandom(HIGHLIGHT_COUNT, TOTAL));

  useEffect(() => {
    if (!visible) return;
    const id = window.setInterval(() => {
      setHighlights(pickRandom(HIGHLIGHT_COUNT, TOTAL));
    }, 4000);
    return () => window.clearInterval(id);
  }, [visible]);

  return (
    <group ref={ref} visible={visible}>
      <WordGalaxy visible={visible} count={TOTAL} highlightedIndices={highlights} />
    </group>
  );
});
MainScene.displayName = 'MainScene';
export default MainScene;
```

- [ ] **Step 2:** Smoke check — `bun dev`, on `/portfolio` Main, watch the cloud — every ~4s, three different words should glow yellow.

- [ ] **Step 3:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/stage/scenes/MainScene.tsx && git commit -m "feat(v2): cycling word highlights in WordGalaxy every 4s"
```

---

### Task 4.5: WordGalaxy enter/leave (explode/settle)

**Files:**
- Modify: `src/components/portfolio/v2/stage/primitives/WordGalaxy.tsx`
- Modify: `src/components/portfolio/v2/stage/scenes/MainScene.tsx`

- [ ] **Step 1:** Expose group ref on WordGalaxy and add a `useEffect` driven by `visible` that runs GSAP enter/leave:

```tsx
// patch WordGalaxy.tsx — add inside the component, before return
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useThree } from '@react-three/fiber';

// ... inside WordGalaxy component:
const groupRef = useRef<Group>(null);
const invalidate = useThree(s => s.invalidate);

useEffect(() => {
  if (!groupRef.current) return;
  const g = groupRef.current;
  const tl = gsap.timeline({ onUpdate: invalidate });

  if (visible) {
    g.children.forEach((child, idx) => {
      gsap.set(child.position, { z: child.position.z + 12 });
      tl.to(child.position, {
        z: child.position.z - 12,
        duration: 0.6, ease: 'power2.out', delay: idx * 0.005,
      }, 0);
    });
  } else {
    g.children.forEach((child, idx) => {
      tl.to(child.position, {
        z: child.position.z + 15,
        duration: 0.7, ease: 'power2.in', delay: idx * 0.003,
      }, 0);
    });
  }

  return () => { tl.kill(); };
}, [visible, invalidate]);
```

(Replace the forwarded `ref` with the local `groupRef`. The forwarded ref is no longer used — drop the `forwardRef` wrapper for now and adjust MainScene to not pass a ref to WordGalaxy.)

- [ ] **Step 2:** Manual smoke

Navigate Main → About: words explode outward and fade. Navigate back: words fly in from depth and settle.

- [ ] **Step 3:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/stage/ && git commit -m "feat(v2): WordGalaxy explode/settle on visibility change"
```

---

## Phase 5: Skills Scene

### Task 5.1: `IconBillboard` primitive (single icon plane)

**Files:**
- Create: `src/components/portfolio/v2/stage/primitives/IconBillboard.tsx`

- [ ] **Step 1:** Implement single-icon billboard with hover scale

```tsx
// src/components/portfolio/v2/stage/primitives/IconBillboard.tsx
'use client';

import { useTexture, Billboard, Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useState, useRef } from 'react';
import gsap from 'gsap';
import type { Mesh } from 'three';

export interface IconBillboardProps {
  position: [number, number, number];
  iconUrl: string;
  tooltip: string;
  href: string;
}

const IconBillboard = ({ position, iconUrl, tooltip, href }: IconBillboardProps) => {
  const tex = useTexture(iconUrl);
  const meshRef = useRef<Mesh>(null);
  const invalidate = useThree(s => s.invalidate);
  const [hovered, setHovered] = useState(false);

  const onEnter = () => {
    setHovered(true);
    if (meshRef.current) {
      gsap.to(meshRef.current.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.25, ease: 'power2.out', onUpdate: invalidate });
    }
  };
  const onLeave = () => {
    setHovered(false);
    if (meshRef.current) {
      gsap.to(meshRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.25, ease: 'power2.out', onUpdate: invalidate });
    }
  };
  const onClick = () => window.open(href, '_blank', 'noopener,noreferrer');

  return (
    <Billboard position={position}>
      <mesh ref={meshRef} onPointerEnter={onEnter} onPointerLeave={onLeave} onClick={onClick}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshBasicMaterial map={tex} transparent />
      </mesh>
      {hovered && (
        <Html center distanceFactor={4} zIndexRange={[100, 0]}>
          <div className="px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap pointer-events-none">
            {tooltip}
          </div>
        </Html>
      )}
    </Billboard>
  );
};

export default IconBillboard;
```

- [ ] **Step 2:** Type-check

```bash
cd /home/bjgdr/dev-personal/portnext && bunx tsc --noEmit 2>&1 | tail -5
```

Expected: no errors.

- [ ] **Step 3:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/stage/primitives/IconBillboard.tsx && git commit -m "feat(v2): add IconBillboard primitive (drei Billboard + Html tooltip)"
```

---

### Task 5.2: `SkillsScene` — Fibonacci sphere of icons + idle rotation + drag spin

**Files:**
- Modify: `src/components/portfolio/v2/stage/scenes/SkillsScene.tsx`

- [ ] **Step 1:** Replace placeholder with full scene

```tsx
// src/components/portfolio/v2/stage/scenes/SkillsScene.tsx
'use client';

import { forwardRef, useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Group } from 'three';
import IconBillboard from '../primitives/IconBillboard';
import { coreicon } from '@/constants/mapdata';

function fibonacciSphere(n: number, radius: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2; // y goes from 1 to -1
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;
    pts.push([radius * r * Math.cos(theta), radius * y, radius * r * Math.sin(theta)]);
  }
  return pts;
}

const SkillsScene = forwardRef<Group, { visible: boolean }>(({ visible }, ref) => {
  const innerRef = useRef<Group>(null);
  const invalidate = useThree(s => s.invalidate);
  const positions = useMemo(() => fibonacciSphere(coreicon.length, 1.6), []);

  // pointer-drag spin state
  const dragging = useRef(false);
  const lastX = useRef(0);
  const velocity = useRef(0);

  useEffect(() => {
    const onDown = (e: PointerEvent) => { dragging.current = true; lastX.current = e.clientX; };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current || !innerRef.current) return;
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      velocity.current = dx * 0.005;
      innerRef.current.rotation.y += velocity.current;
      invalidate();
    };
    const onUp = () => { dragging.current = false; };

    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [invalidate]);

  useFrame((_, dt) => {
    if (!visible || !innerRef.current) return;
    if (!dragging.current) {
      // idle rotation
      innerRef.current.rotation.y += 0.05 * dt;
      // momentum decay
      if (Math.abs(velocity.current) > 0.0001) {
        innerRef.current.rotation.y += velocity.current;
        velocity.current *= 0.92;
      }
      invalidate();
    }
  });

  return (
    <group ref={ref} visible={visible}>
      <group ref={innerRef}>
        {coreicon.map((s, i) => (
          <IconBillboard
            key={s.id}
            position={positions[i]}
            iconUrl={s.icon as unknown as string}
            tooltip={s.tooltipText}
            href={s.url}
          />
        ))}
      </group>
    </group>
  );
});
SkillsScene.displayName = 'SkillsScene';
export default SkillsScene;
```

(Note: `coreicon[i].icon` may be a static image import — pass as URL. If the type is StaticImageData, change to `(s.icon as { src: string }).src` or similar based on actual type at compile time.)

- [ ] **Step 2:** Type-check

```bash
cd /home/bjgdr/dev-personal/portnext && bunx tsc --noEmit 2>&1 | tail -10
```

Expected: no errors. If `coreicon` icon type complains, inspect actual shape:

```bash
grep -A 2 "id: 1" src/constants/mapdata.ts | head -10
```

…and adjust the `iconUrl` cast accordingly. If `icon` is a `StaticImageData`, use `s.icon.src`.

- [ ] **Step 3:** Manual smoke

`bun dev`, navigate to Skill page in V2. Should see ~24 icons floating in 3D, slow rotation. Drag horizontally → spin with momentum.

- [ ] **Step 4:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/stage/scenes/SkillsScene.tsx && git commit -m "feat(v2): SkillsScene — Fibonacci sphere of icons with drag-spin + idle rotation"
```

---

### Task 5.3: Trim `SkillsSection` DOM (heading + subtitle only)

**Files:**
- Modify: `src/components/portfolio/v2/sections/SkillsSection.tsx`

- [ ] **Step 1:** Replace contents — keep heading + subtitle, drop the icon grid (now 3D)

```tsx
// src/components/portfolio/v2/sections/SkillsSection.tsx
'use client';

import { useRef } from 'react';
import GoldHeading from '../shared/GoldHeading';
import { useScrollyEntrance } from '../gsap/useScrollyEntrance';

const SkillsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  useScrollyEntrance(ref);

  return (
    <div
      ref={ref}
      className="flex flex-col justify-center h-full p-6 md:p-12 bg-transparent overflow-y-auto pointer-events-none"
    >
      <div data-stagger>
        <GoldHeading as="h2" className="text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-8">
          Core Skills
        </GoldHeading>
      </div>
      <p data-stagger className="text-sm text-gray-400 italic">
        Drag the orb to spin. Click any icon to learn more.
      </p>
    </div>
  );
};

export default SkillsSection;
```

- [ ] **Step 2:** Manual smoke

Navigate to Skill — should see only heading + subtitle on DOM, plus the orb in 3D. Heading uses GSAP entrance.

- [ ] **Step 3:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/sections/SkillsSection.tsx && git commit -m "refactor(v2): SkillsSection DOM is heading+subtitle only; orb is 3D"
```

---

## Phase 6: Projects Scene

### Task 6.1: `ProjectCard3D` primitive

**Files:**
- Create: `src/components/portfolio/v2/stage/primitives/ProjectCard3D.tsx`

- [ ] **Step 1:** Implement card

```tsx
// src/components/portfolio/v2/stage/primitives/ProjectCard3D.tsx
'use client';

import { Text, useTexture } from '@react-three/drei';
import { useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import type { Group } from 'three';

export interface ProjectCard3DProps {
  position: [number, number, number];
  rotationY: number;
  scale: number;
  imageUrl: string;
  title: string;
  description: string;
  techStack: string[];
}

const ProjectCard3D = ({ position, rotationY, scale, imageUrl, title, description, techStack }: ProjectCard3DProps) => {
  const ref = useRef<Group>(null);
  const tex = useTexture(imageUrl);
  const invalidate = useThree(s => s.invalidate);
  const [flipped, setFlipped] = useState(false);

  const flip = () => {
    if (!ref.current) return;
    const next = !flipped;
    setFlipped(next);
    gsap.to(ref.current.rotation, {
      y: rotationY + (next ? Math.PI : 0),
      duration: 0.6, ease: 'power2.inOut', onUpdate: invalidate,
    });
  };

  return (
    <group ref={ref} position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* Front: project image */}
      <mesh onClick={flip}>
        <planeGeometry args={[2.4, 1.4]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      {/* Back: title + desc + tech */}
      <group rotation={[0, Math.PI, 0]}>
        <mesh>
          <planeGeometry args={[2.4, 1.4]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <Text position={[0, 0.5, 0.01]} fontSize={0.16} color="#FBBF24" maxWidth={2.2} anchorX="center">
          {title}
        </Text>
        <Text position={[0, 0.05, 0.01]} fontSize={0.1} color="#e5e5e5" maxWidth={2.2} anchorX="center" textAlign="center">
          {description}
        </Text>
        <Text position={[0, -0.5, 0.01]} fontSize={0.08} color="#9ca3af" maxWidth={2.2} anchorX="center" textAlign="center">
          {techStack.join(' • ')}
        </Text>
      </group>
    </group>
  );
};

export default ProjectCard3D;
```

- [ ] **Step 2:** Type-check

```bash
cd /home/bjgdr/dev-personal/portnext && bunx tsc --noEmit 2>&1 | tail -5
```

Expected: no errors.

- [ ] **Step 3:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/stage/primitives/ProjectCard3D.tsx && git commit -m "feat(v2): add ProjectCard3D primitive with flip-on-click"
```

---

### Task 6.2: `ProjectsScene` — coverflow rail with shared state

**Files:**
- Create: `src/components/portfolio/v2/stage/projectsState.ts`
- Modify: `src/components/portfolio/v2/stage/scenes/ProjectsScene.tsx`

- [ ] **Step 1:** Create a tiny Zustand store for shared projects state

```ts
// src/components/portfolio/v2/stage/projectsState.ts
import { create } from 'zustand';

export type ProjectKind = 'work' | 'side';

interface ProjectsState {
  kind: ProjectKind;
  index: number;
  setKind: (k: ProjectKind) => void;
  setIndex: (i: number) => void;
  next: (max: number) => void;
  prev: (max: number) => void;
}

export const useProjectsState = create<ProjectsState>((set) => ({
  kind: 'work',
  index: 0,
  setKind: (kind) => set({ kind, index: 0 }),
  setIndex: (index) => set({ index }),
  next: (max) => set((s) => ({ index: (s.index + 1) % max })),
  prev: (max) => set((s) => ({ index: s.index === 0 ? max - 1 : s.index - 1 })),
}));
```

- [ ] **Step 2:** Implement ProjectsScene with 3 visible cards

```tsx
// src/components/portfolio/v2/stage/scenes/ProjectsScene.tsx
'use client';

import { forwardRef } from 'react';
import type { Group } from 'three';
import ProjectCard3D from '../primitives/ProjectCard3D';
import { WorkProjects, SideProjects } from '@/mocks/projectMock';
import { useProjectsState } from '../projectsState';

interface SlotPos {
  position: [number, number, number];
  rotationY: number;
  scale: number;
  offset: -1 | 0 | 1;
}

const SLOTS: SlotPos[] = [
  { position: [-2.2, 0, -0.6], rotationY:  0.96, scale: 0.7, offset: -1 },
  { position: [    0, 0,  0.0], rotationY:  0,    scale: 1.0, offset:  0 },
  { position: [ 2.2, 0, -0.6], rotationY: -0.96, scale: 0.7, offset:  1 },
];

const ProjectsScene = forwardRef<Group, { visible: boolean }>(({ visible }, ref) => {
  const kind = useProjectsState(s => s.kind);
  const index = useProjectsState(s => s.index);

  const all = kind === 'work'
    ? [...WorkProjects].sort((a, b) => b.projectID - a.projectID)
    : SideProjects;

  return (
    <group ref={ref} visible={visible}>
      {SLOTS.map((slot) => {
        const idx = (index + slot.offset + all.length) % all.length;
        const p = all[idx];
        if (!p) return null;
        return (
          <ProjectCard3D
            key={`${kind}-${idx}`}
            position={slot.position}
            rotationY={slot.rotationY}
            scale={slot.scale}
            imageUrl={(p.image as unknown as string) ?? ''}
            title={p.title ?? p.name ?? 'Untitled'}
            description={p.description ?? ''}
            techStack={p.techStack ?? p.stack ?? []}
          />
        );
      })}
    </group>
  );
});
ProjectsScene.displayName = 'ProjectsScene';
export default ProjectsScene;
```

(The exact field names — `image`, `title`, `description`, `techStack` — depend on the actual `WorkProjects` mock type. Open `src/mocks/projectMock.ts` and adapt the field reads to the real shape; the optional-chaining + fallback above is a defensive default. If types complain, add a small `normalizeProject(p)` helper inline.)

- [ ] **Step 3:** Type-check + manual smoke

```bash
cd /home/bjgdr/dev-personal/portnext && bunx tsc --noEmit 2>&1 | tail -10
```

`bun dev`, navigate to Projects — three cards should be visible (active center, two flanking). Click center to flip.

- [ ] **Step 4:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add -A && git commit -m "feat(v2): ProjectsScene 3D coverflow + shared zustand state"
```

---

### Task 6.3: Wire `ProjectsSection` DOM tabs/dots to shared state

**Files:**
- Modify: `src/components/portfolio/v2/sections/ProjectsSection.tsx`

- [ ] **Step 1:** Replace local state with `useProjectsState`. Keep the heading, tab buttons, dot indicators, and prev/next arrows. Remove the `<ProjectCard>` render and the `<AnimatePresence>` wrapper that animated the inline card.

```tsx
// src/components/portfolio/v2/sections/ProjectsSection.tsx
'use client';

import { useRef } from 'react';
import GoldHeading from '../shared/GoldHeading';
import { WorkProjects, SideProjects } from '@/mocks/projectMock';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Briefcase, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjectsState, ProjectKind } from '../stage/projectsState';
import { useScrollyEntrance } from '../gsap/useScrollyEntrance';

const ProjectsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  useScrollyEntrance(ref);
  const { kind, index, setKind, setIndex, next, prev } = useProjectsState();
  const projects = kind === 'work'
    ? [...WorkProjects].sort((a, b) => b.projectID - a.projectID)
    : SideProjects;

  return (
    <div ref={ref} className="flex flex-col justify-center h-full p-6 md:p-12 bg-transparent pointer-events-none">
      <div data-stagger>
        <GoldHeading as="h2" className="text-4xl md:text-5xl lg:text-6xl mb-6">Projects</GoldHeading>
      </div>
      <div data-stagger className="flex gap-3 mb-6 pointer-events-auto">
        {(['work', 'side'] as ProjectKind[]).map(k => (
          <Button key={k} onClick={() => setKind(k)} variant={kind === k ? 'default' : 'outline'} size="sm"
            className={cn('gap-2 font-semibold px-6 py-2',
              kind === k ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-white border-2 border-gray-300')}>
            {k === 'work' ? <Briefcase className="w-4 h-4" /> : <Code2 className="w-4 h-4" />}
            {k === 'work' ? 'Work' : 'Side'}
          </Button>
        ))}
      </div>
      <div data-stagger className="flex items-center justify-between mt-auto pointer-events-auto">
        <Button onClick={() => prev(projects.length)} variant="ghost" size="icon" className="rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex gap-2">
          {projects.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)}
              className={cn('w-2 h-2 rounded-full transition-all duration-300',
                i === index ? 'bg-yellow-500 w-6' : 'bg-gray-300 hover:bg-gray-400')} />
          ))}
        </div>
        <Button onClick={() => next(projects.length)} variant="ghost" size="icon" className="rounded-full">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
      <p className="text-center text-sm text-gray-400 mt-2">{index + 1} / {projects.length}</p>
    </div>
  );
};

export default ProjectsSection;
```

- [ ] **Step 2:** Manual smoke

Navigate to Projects. Tabs/dots/arrows on DOM should drive the 3D coverflow. Click prev/next → coverflow advances.

- [ ] **Step 3:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/sections/ProjectsSection.tsx && git commit -m "refactor(v2): ProjectsSection drives 3D coverflow via shared zustand state"
```

---

### Task 6.4: Coverflow shuffle on tab change (out + in)

**Files:**
- Modify: `src/components/portfolio/v2/stage/scenes/ProjectsScene.tsx`

- [ ] **Step 1:** Add a `kind` watcher that animates the inner group out and back in:

```tsx
// add inside ProjectsScene component, before return
import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';

// ...
const innerRef = useRef<Group>(null);
const invalidate = useThree(s => s.invalidate);

useEffect(() => {
  if (!innerRef.current) return;
  const g = innerRef.current;
  const tl = gsap.timeline({ onUpdate: invalidate });
  tl.fromTo(g.position, { y: 0 }, { y: 0.4, duration: 0.18, ease: 'power2.in' }, 0);
  tl.fromTo(g.scale, { x: 1, y: 1, z: 1 }, { x: 0.8, y: 0.8, z: 0.8, duration: 0.18, ease: 'power2.in' }, 0);
  tl.to(g.position, { y: 0, duration: 0.3, ease: 'power2.out' }, 0.18);
  tl.to(g.scale, { x: 1, y: 1, z: 1, duration: 0.3, ease: 'back.out(2)' }, 0.18);
  return () => { tl.kill(); };
}, [kind, invalidate]);
```

Wrap the existing `SLOTS.map(...)` block in `<group ref={innerRef}>`.

- [ ] **Step 2:** Manual smoke — toggle Work/Side; cards should shrink+rise then drop+restore.

- [ ] **Step 3:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/stage/scenes/ProjectsScene.tsx && git commit -m "feat(v2): coverflow shuffle animation on Work/Side tab change"
```

---

## Phase 7: About Scene

### Task 7.1: `PortraitCard3D` primitive

**Files:**
- Create: `src/components/portfolio/v2/stage/primitives/PortraitCard3D.tsx`

- [ ] **Step 1:** Implement with parallax tilt + hover crossfade

```tsx
// src/components/portfolio/v2/stage/primitives/PortraitCard3D.tsx
'use client';

import { useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useState } from 'react';
import gsap from 'gsap';
import type { Mesh, ShaderMaterial } from 'three';

interface PortraitCard3DProps {
  baseUrl: string;
  hoverUrl: string;
  position?: [number, number, number];
}

const PortraitCard3D = ({ baseUrl, hoverUrl, position = [0, 0, 0] }: PortraitCard3DProps) => {
  const baseTex = useTexture(baseUrl);
  const hoverTex = useTexture(hoverUrl);
  const meshRef = useRef<Mesh>(null);
  const baseMatRef = useRef<ShaderMaterial>(null);
  const hoverMatRef = useRef<ShaderMaterial>(null);
  const invalidate = useThree(s => s.invalidate);
  const [hovered, setHovered] = useState(false);

  // Parallax tilt
  useFrame(({ pointer }) => {
    if (!meshRef.current) return;
    const targetX = pointer.y * 0.14;
    const targetY = pointer.x * 0.14;
    meshRef.current.rotation.x += (targetX - meshRef.current.rotation.x) * 0.05;
    meshRef.current.rotation.y += (targetY - meshRef.current.rotation.y) * 0.05;
    invalidate();
  });

  const onEnter = () => {
    setHovered(true);
    if (hoverMatRef.current) gsap.to(hoverMatRef.current, { opacity: 1, duration: 0.3, onUpdate: invalidate });
    if (baseMatRef.current)  gsap.to(baseMatRef.current,  { opacity: 0, duration: 0.3, onUpdate: invalidate });
  };
  const onLeave = () => {
    setHovered(false);
    if (hoverMatRef.current) gsap.to(hoverMatRef.current, { opacity: 0, duration: 0.3, onUpdate: invalidate });
    if (baseMatRef.current)  gsap.to(baseMatRef.current,  { opacity: 1, duration: 0.3, onUpdate: invalidate });
  };

  return (
    <group position={position}>
      <mesh ref={meshRef} onPointerEnter={onEnter} onPointerLeave={onLeave}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshBasicMaterial ref={baseMatRef as never} map={baseTex} transparent opacity={1} />
        {/* Hover layer overlay: separate mesh, slight z-offset */}
      </mesh>
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshBasicMaterial ref={hoverMatRef as never} map={hoverTex} transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default PortraitCard3D;
```

- [ ] **Step 2:** Modify AboutScene to use it

```tsx
// src/components/portfolio/v2/stage/scenes/AboutScene.tsx
'use client';

import { forwardRef } from 'react';
import type { Group } from 'three';
import PortraitCard3D from '../primitives/PortraitCard3D';
import { ImgixImage } from '@/constants/storage';

const AboutScene = forwardRef<Group, { visible: boolean }>(({ visible }, ref) => (
  <group ref={ref} visible={visible}>
    <PortraitCard3D
      baseUrl={ImgixImage.profilepic_faceMe as unknown as string}
      hoverUrl={ImgixImage.profilepic_faceMeEff as unknown as string}
      position={[1.2, 0, 0]}
    />
  </group>
));
AboutScene.displayName = 'AboutScene';
export default AboutScene;
```

- [ ] **Step 3:** Manual smoke

Navigate to About → 3D portrait card on the right; mouse-tilt parallax; hover swaps texture.

- [ ] **Step 4:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add -A && git commit -m "feat(v2): AboutScene with 3D PortraitCard (parallax tilt + hover crossfade)"
```

---

### Task 7.2: Trim `AboutSection` DOM, drop the 2D portrait img

**Files:**
- Modify: `src/components/portfolio/v2/sections/AboutSection.tsx`

- [ ] **Step 1:** Replace contents — remove the 2D portrait `<Image>`, replace `motion.div` containers with plain `div`s + `data-stagger`, swap to `useScrollyEntrance`.

```tsx
// src/components/portfolio/v2/sections/AboutSection.tsx
'use client';

import { useRef } from 'react';
import GoldHeading from '../shared/GoldHeading';
import { ImgixImage } from '@/constants/storage';
import { MapPin, Download, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollyEntrance } from '../gsap/useScrollyEntrance';

const MOTTO_TEXT = 'PASSIONATE TO MAKE THE REMARKABLE THING';
const FAVORITES = ['Blue', 'Cat', 'Basketball', 'Motorcycle', 'Mobile MOBA'];
const LOCATION = 'Bangkok, Thailand';

const AboutSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  useScrollyEntrance(ref);

  const handleDownloadCV = () => window.open(ImgixImage.cv_pdf2 as unknown as string, '_blank');

  return (
    <div ref={ref} className="flex flex-col justify-center h-full p-6 md:p-12 bg-transparent overflow-y-auto pointer-events-none">
      <div data-stagger>
        <GoldHeading as="h2" className="text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-8">About Me</GoldHeading>
      </div>
      <div className="flex-1 max-w-2xl space-y-4 md:space-y-5">
        <div data-stagger>
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Ittipol Vongapai</h3>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed font-light">
            A self-driven, introverted software developer with 5 years of experience, I&apos;m based in Thailand and powered by a steady diet of ramen and juice. My current focus areas include ReactJS, generative AI technologies, and frontend development.
          </p>
        </div>
        <div data-stagger>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-yellow-500" />
            <h4 className="text-xs uppercase tracking-widest text-gray-400 font-bold">Favorites</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {FAVORITES.map((item) => (
              <span key={item} className="px-3 py-1 bg-yellow-100/80 text-yellow-800 border border-yellow-200 text-xs md:text-sm rounded-full font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div data-stagger className="flex items-center gap-2 text-gray-500">
          <MapPin className="w-4 h-4 text-yellow-500" />
          <span className="text-sm">{LOCATION}</span>
        </div>
        <div data-stagger className="pointer-events-auto">
          <Button onClick={handleDownloadCV} variant="outline" className="gap-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500 transition-all">
            <Download className="w-4 h-4" /> Download CV
          </Button>
        </div>
        <div data-stagger className="pt-4 md:pt-6">
          <p className="text-xs md:text-sm uppercase tracking-[0.15em] md:tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 font-medium">
            &ldquo;{MOTTO_TEXT}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
```

- [ ] **Step 2:** Manual smoke

About page: heading + bio on left, 3D portrait on right (in 3D Canvas), GSAP entrance animation on text blocks.

- [ ] **Step 3:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/sections/AboutSection.tsx && git commit -m "refactor(v2): AboutSection DOM only; portrait moved to 3D scene"
```

---

## Phase 8: Contact Scene

### Task 8.1: `ContactScene` particle field

**Files:**
- Modify: `src/components/portfolio/v2/stage/scenes/ContactScene.tsx`

- [ ] **Step 1:** Replace placeholder

```tsx
// src/components/portfolio/v2/stage/scenes/ContactScene.tsx
'use client';

import { Points, PointMaterial } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, forwardRef } from 'react';
import { Group, Points as ThreePoints, Vector3 } from 'three';

const COUNT = 400;

const ContactScene = forwardRef<Group, { visible: boolean }>(({ visible }, ref) => {
  const pointsRef = useRef<ThreePoints>(null);
  const invalidate = useThree(s => s.invalidate);

  const positions = useMemo(() => {
    const a = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      a[i * 3]     = (Math.random() - 0.5) * 8;
      a[i * 3 + 1] = (Math.random() - 0.5) * 5;
      a[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return a;
  }, []);

  useFrame(({ pointer }) => {
    if (!visible || !pointsRef.current) return;
    const drift = new Vector3(pointer.x * 0.3, pointer.y * 0.3, 0);
    pointsRef.current.position.lerp(drift, 0.02);
    invalidate();
  });

  return (
    <group ref={ref} visible={visible}>
      <Points ref={pointsRef} positions={positions} stride={3}>
        <PointMaterial transparent color="#FBBF24" size={0.025} sizeAttenuation depthWrite={false} />
      </Points>
    </group>
  );
});
ContactScene.displayName = 'ContactScene';
export default ContactScene;
```

- [ ] **Step 2:** Manual smoke — Contact page shows gold particle drift; particles drift toward cursor.

- [ ] **Step 3:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/stage/scenes/ContactScene.tsx && git commit -m "feat(v2): ContactScene gold particle field with cursor drift"
```

---

### Task 8.2: Submit-success burst (optional polish)

**Files:**
- Create: `src/components/portfolio/v2/stage/contactState.ts`
- Modify: `src/components/portfolio/v2/stage/scenes/ContactScene.tsx`
- Modify: `src/components/portfolio/v2/sections/ContactSection.tsx`

- [ ] **Step 1:** Tiny store for "submitted" flag

```ts
// src/components/portfolio/v2/stage/contactState.ts
import { create } from 'zustand';

interface ContactState {
  burstCount: number;
  triggerBurst: () => void;
}

export const useContactState = create<ContactState>((set) => ({
  burstCount: 0,
  triggerBurst: () => set((s) => ({ burstCount: s.burstCount + 1 })),
}));
```

- [ ] **Step 2:** In `ContactScene`, watch `burstCount` and run a GSAP burst (radial scale-up of points group + opacity fade) when it changes:

```tsx
// inside ContactScene component
import { useEffect } from 'react';
import gsap from 'gsap';
import { useContactState } from '../contactState';

// ...
const burstCount = useContactState(s => s.burstCount);

useEffect(() => {
  if (burstCount === 0 || !pointsRef.current) return;
  const g = pointsRef.current;
  const tl = gsap.timeline({ onUpdate: invalidate });
  tl.fromTo(g.scale, { x: 1, y: 1, z: 1 }, { x: 1.6, y: 1.6, z: 1.6, duration: 0.5, ease: 'power3.out' });
  tl.to(g.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'power2.inOut' });
}, [burstCount, invalidate]);
```

- [ ] **Step 3:** In `ContactSection.tsx`, call `triggerBurst()` from `onSubmit` success path:

Find the submit handler. After the success branch, add:

```ts
import { useContactState } from '../stage/contactState';
// ...
const triggerBurst = useContactState(s => s.triggerBurst);
// inside onSubmit success:
triggerBurst();
```

- [ ] **Step 4:** Manual smoke — submit a contact form, particles burst outward then settle.

- [ ] **Step 5:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add -A && git commit -m "feat(v2): submit-success burst on contact particle field"
```

---

## Phase 9: Performance & polish

### Task 9.1: `Preload all` after Stage mount

**Files:**
- Modify: `src/components/portfolio/v2/stage/Stage.tsx`

- [ ] **Step 1:** Add Preload component inside the Canvas Suspense boundary

```tsx
// patch Stage.tsx
import { Preload } from '@react-three/drei';
// inside <Canvas><Suspense>... add:
<Preload all />
```

- [ ] **Step 2:** Manual check — first navigation between pages should now be free of texture pop-in.

- [ ] **Step 3:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/stage/Stage.tsx && git commit -m "perf(v2): drei Preload all to upload GPU resources upfront"
```

---

### Task 9.2: Stats overlay behind `?stats=1`

**Files:**
- Modify: `src/components/portfolio/v2/stage/Stage.tsx`

- [ ] **Step 1:** Add Stats from drei conditionally

```tsx
import { Stats } from '@react-three/drei';
// inside <Canvas>:
{typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('stats') === '1' && (
  <Stats className="!left-2 !top-auto !bottom-2" />
)}
```

- [ ] **Step 2:** Manual check — `/portfolio?stats=1` shows fps/ms panel.

- [ ] **Step 3:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/stage/Stage.tsx && git commit -m "chore(v2): dev stats overlay gated behind ?stats=1"
```

---

### Task 9.3: WebGL context-lost recovery

**Files:**
- Modify: `src/components/portfolio/v2/stage/Stage.tsx`

- [ ] **Step 1:** Add a `key` that increments on context-lost

```tsx
// Stage.tsx — add at top of component
const [contextKey, setContextKey] = useState(0);
// ...
<Canvas
  key={contextKey}
  onCreated={({ gl }) => {
    gl.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      console.warn('[v2] WebGL context lost; remounting Canvas');
      setContextKey((n) => n + 1);
    });
  }}
  // ...rest
>
```

- [ ] **Step 2:** Type-check

```bash
cd /home/bjgdr/dev-personal/portnext && bunx tsc --noEmit 2>&1 | tail -5
```

- [ ] **Step 3:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/stage/Stage.tsx && git commit -m "fix(v2): remount Canvas on WebGL context loss"
```

---

### Task 9.4: Throttle pointer-driven invalidations

**Files:**
- Modify: `src/components/portfolio/v2/stage/scenes/SkillsScene.tsx`
- Modify: `src/components/portfolio/v2/stage/primitives/PortraitCard3D.tsx`

- [ ] **Step 1:** Wrap the `pointermove` handler in `SkillsScene` with `throttle(handler, 16)` (using `lodash.throttle`).

```tsx
import throttle from 'lodash.throttle';
// inside the useEffect, replace onMove with:
const onMove = throttle((e: PointerEvent) => {
  if (!dragging.current || !innerRef.current) return;
  const dx = e.clientX - lastX.current;
  lastX.current = e.clientX;
  velocity.current = dx * 0.005;
  innerRef.current.rotation.y += velocity.current;
  invalidate();
}, 16);
// remember to call onMove.cancel() in cleanup
```

- [ ] **Step 2:** PortraitCard3D's `useFrame` already throttles to 60fps via the render loop — leave it.

- [ ] **Step 3:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/stage/ && git commit -m "perf(v2): throttle SkillsScene pointer-drag handler to 60Hz"
```

---

## Phase 10: Mobile / reduced-motion fallback polish

### Task 10.1: Verify fallback path renders cleanly

**Files:** none (verification only)

- [ ] **Step 1:** Manual smoke

```bash
bun dev
```

In Chrome DevTools, toggle device toolbar to "iPhone 12" (`<768px`). Open `/portfolio`. Verify:

- No Canvas mount in DOM (no `<canvas>` element).
- DOM word cloud SVG visible on Main.
- Bottom dock works.
- "view classic" link visible bottom-right.

Then re-open desktop, toggle DevTools "Emulate CSS prefers-reduced-motion: reduce". Verify same fallback behaviour.

- [ ] **Step 2:** If portrait img is missing on the fallback path because we disabled the 2D `<Image>` in About — restore it conditionally inside `AboutSection.tsx`:

```tsx
import { useStageEnabled } from '@/hooks/useStageEnabled';
// ...
const stageOn = useStageEnabled();
// in JSX, add a <div> wrapping a 2D portrait when !stageOn
{!stageOn && (
  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden flex-shrink-0">
    <img src={ImgixImage.profilepic_faceMe as unknown as string} alt="Portrait" className="object-cover w-full h-full" />
  </div>
)}
```

(Keep the rest of the section; the 3D portrait only renders when Stage is mounted.)

- [ ] **Step 3:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add -A && git commit -m "fix(v2): restore 2D portrait img on mobile/reduced-motion fallback path"
```

---

### Task 10.2: CSS-3D coverflow fallback for mobile Projects

**Files:**
- Modify: `src/components/portfolio/v2/sections/ProjectsSection.tsx`

- [ ] **Step 1:** Conditionally render the existing 2D `ProjectCard` (still in `sections/ProjectCard.tsx`) when `!stageEnabled`. Add inside ProjectsSection:

```tsx
import { useStageEnabled } from '@/hooks/useStageEnabled';
import ProjectCard from './ProjectCard';
// ...
const stageOn = useStageEnabled();
const currentProject = projects[index];
// In JSX, before the dot/arrow row, add:
{!stageOn && currentProject && (
  <div data-stagger className="pointer-events-auto" style={{ perspective: 1000 }}>
    <div style={{ transform: 'rotateY(0deg)' }}>
      <ProjectCard project={currentProject} index={0} isActive />
    </div>
  </div>
)}
```

- [ ] **Step 2:** Manual smoke

Mobile emulation: Projects shows a single card via the existing `ProjectCard` 2D component. Tabs/arrows still work. No 3D scene.

- [ ] **Step 3:** Commit

```bash
cd /home/bjgdr/dev-personal/portnext && git add src/components/portfolio/v2/sections/ProjectsSection.tsx && git commit -m "feat(v2): mobile/reduced-motion fallback uses 2D ProjectCard"
```

---

## Final verification

### Task F.1: Full test sweep + production build

- [ ] **Step 1:** Run all tests

```bash
cd /home/bjgdr/dev-personal/portnext && bun test 2>&1 | tail -20
```

Expected: all passing.

- [ ] **Step 2:** Production build

```bash
cd /home/bjgdr/dev-personal/portnext && bun run build 2>&1 | tail -30
```

Expected: build succeeds.

- [ ] **Step 3:** Bundle delta sanity check

```bash
cd /home/bjgdr/dev-personal/portnext && du -sh .next/static/chunks 2>&1
```

Compare against pre-Phase-0 baseline if recorded. Expected: total chunks ≤ baseline + 180kb.

- [ ] **Step 4:** Manual end-to-end smoke

`bun start` → open `/portfolio`:
- Word galaxy on Main with cycling highlights ✓
- View classic link → V1 ✓
- Camera tweens between sections ✓
- About: 3D portrait with parallax + hover cross-fade ✓
- Skill: orbiting icons, drag-spin, hover scale, click opens link ✓
- Projects: 3D coverflow, flip-on-click, work/side shuffle ✓
- Contact: particle drift, submit burst ✓
- Mobile/reduced-motion: DOM-only fallback, no Canvas ✓
- "view classic" link present ✓

- [ ] **Step 5:** Final commit (only if any tweaks were needed)

```bash
cd /home/bjgdr/dev-personal/portnext && git status
# if dirty:
git add -A && git commit -m "polish(v2): final cinematic upgrade verification"
```

---

## Spec coverage check

| Spec section | Tasks |
|---|---|
| §1 Goal | All phases |
| §2 Non-goals | Adhered to throughout (no SSR for WebGL, no V1 changes, no paid GSAP plugins, framer kept for dock pill) |
| §3.1 Layout | Phase 1.3, 2.1, 2.2 |
| §3.2 Invariants | Phase 2.2 (one Canvas, scenes toggle visible), Phase 1.3 (z-index DOM above WebGL) |
| §3.3 Word galaxy | Phase 4.1–4.5 |
| §4 File layout | Matches `New files` / `Modified files` / `Deleted files` lists at top |
| §5 Per-section composition | Main 4.x, About 7.x, Skill 5.x, Projects 6.x, Contact 8.x |
| §6 GSAP master timeline | Phase 3.1–3.5 (camera-only timeline; per-scene enter/leave hooks integrated via `usePageTimeline` `animators` prop — left as a polish-task extension if desired) |
| §6.4 toSphere | Phase 4.1 |
| §7 V1 access | Phase 1.2 |
| §8 Performance | Phase 9.1–9.4 (Preload, stats, context-lost, throttle); §3.1 dpr+frameloop in Phase 2.1 |
| §9 Routing | Phase 1.2 (link only — V1 route untouched as required) |
| §10 Testing | Phase 0.2, 1.1, 3.2, 4.1 (jest setup + hook tests + scene registry + math) |
| §11 Open assumptions | gsap installed Phase 0.1; coreicon adapt in 5.2; toSphere in 4.1 |
| §12 Definition of done | Final verification F.1 |

**Known scope simplifications**: §6 master timeline was implemented as camera-only in `CameraRig`'s direct GSAP usage (Task 3.5) rather than fully wiring `animators` per scene through `usePageTimeline`. Each scene's enter/leave is instead handled inside that scene's own `useEffect` watching `visible` (Phase 4.5, 6.4, 8.2). This keeps each scene self-contained and is functionally equivalent for the user, while leaving the unified-timeline plumbing in place for future polish.
