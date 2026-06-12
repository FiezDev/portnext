# Tasks — word-hunt (Hero Word-Hunt Game)

Source of truth for execution order. Status flips inline; agents re-read this on
every entry. (Interactive UI game — "tests" = unit tests for pure logic +
`tsc --noEmit` + visual QA in the REAL PortfolioV2Content shell.)

Status legend: `[ ]` todo · `[~]` in-progress · `[x]` done

## T1 — Pure game logic + unit tests
- **Status:** [x] done
- **Depends on:** —
- **Acceptance:**
  - [ ] `heroGameLogic.ts` is React/DOM-free (pure functions only)
  - [ ] `pickNextTarget(words, prev)` never returns `prev` back-to-back (unless 1 word left)
  - [ ] `pickGameWords(allWords, n, seed)` returns `n` UNIQUE words, deterministic per seed
  - [ ] streak + score helpers + `formatTime(ms|s)` correct
  - [ ] `loadBest`/`saveBest` are SSR/localStorage-safe (no throw when absent)
  - [ ] `tsc --noEmit` clean; all unit tests green
- **Tests:** `src/components/portfolio/v2/game/heroGameLogic.test.ts` — target-picker no-repeat, sparse-picker uniqueness+determinism, streak, formatTime, best load/save guards
- **Notes:** done @ b35829a (branch feat/hero-word-hunt). 24 tests green. Added jest.config.mjs (next/jest) + jest.setup.ts — no jest config existed before. Scatter uses centered jittered grid (cols=ceil(sqrt(n))) with cell-bounded jitter → guaranteed non-overlap.

## T2 — Cloud gameActive transform (reuse existing cloud)
- **Status:** [~] in-progress
- **Depends on:** —
- **Acceptance:**
  - [ ] `useCloudText` parametrized: `count`, `seed`, `gameActive` (defaults keep current decorative behavior)
  - [ ] `gameActive` → cloud re-randomizes SPARSE (~20), recenters to (500,500), opacity→1, `pointer-events-auto`
  - [ ] decorative 5s flicker loop disabled while `gameActive`
  - [ ] per-word identity exposed so a word can be clicked / glowed / shattered
  - [ ] decorative cloud UNCHANGED when `gameActive` is false (no regression)
  - [ ] `tsc --noEmit` clean
- **Tests:** visual — toggle gameActive in the real shell; cloud transforms; console-log word clicks fire
- **Notes:**

## T3 — Game loop + HUD + START bracket
- **Status:** [ ] todo
- **Depends on:** T1, T2
- **Acceptance:**
  - [ ] `StartBracket.tsx` — left-bracket "START!" button at hero left-center (idle only)
  - [ ] `useHeroGame.ts` — phase idle|playing|over, 15s timer (single tick, no per-frame thrash), score, streak, current target
  - [ ] `GameHUD.tsx` — 15s timer (top), "Find: WORD" pill (bottom-center), live score+streak, ✕ quit, end screen (score + Best + Play Again + Back)
  - [ ] START → playing: hero (heading/title/quote + portrait) hidden; cloud becomes the board
  - [ ] correct click → +1, advance to next target instantly; 15s → over
  - [ ] Play Again restarts; Back / ✕ → idle hero
  - [ ] `tsc --noEmit` clean
- **Tests:** visual — full loop playable in the real shell (plain pop on hit acceptable here)
- **Notes:**

## T4 — Shatter + glow + a11y polish
- **Status:** [ ] todo
- **Depends on:** T3
- **Acceptance:**
  - [ ] correct hit → target word shatters into ≤8 per-letter SVG fragments (translate+rotate+opacity out)
  - [ ] target gold-glow ramp (subtle→intense over ~2s, hold at max)
  - [ ] wrong click → quick red shake, no score/time penalty
  - [ ] `prefers-reduced-motion` → fragments/ramp degrade to simple fade
  - [ ] subtle hover lift (desktop) + cloud-assemble-in on start
  - [ ] no visible jank with ~20 words; transform/opacity-only
  - [ ] `tsc --noEmit` clean
- **Tests:** visual — desktop feel + reduced-motion emulation
- **Notes:**

## T5 — Hide nav + responsive QA + ship
- **Status:** [ ] todo
- **Depends on:** T3
- **Acceptance:**
  - [ ] `gameActive` lifted to `PortfolioV2Content`; bottom nav hidden during play, restored on exit
  - [ ] fully responsive + touch: playable at ~390 (mobile) and desktop; tap targets adequate
  - [ ] no horizontal overflow; end screen + ✕ reachable on mobile
  - [ ] verified in the REAL PortfolioV2Content shell (Playwright, DOM-click nav) at desktop + mobile
  - [ ] `tsc --noEmit` + unit tests green; committed; deployed; live-verified on `/portfolio`
- **Tests:** multi-width screenshots in the real shell; live-site check
- **Notes:**

---
**Closeout:** after all tasks — tsc + unit tests green, commit(s) pushed to main
(Vercel auto-deploys), live-verify on fiez.dev/portfolio. Show before/after +
the game running. Update journal.md with any bug-loop entries.
