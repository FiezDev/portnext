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
- **Status:** [x] done
- **Depends on:** —
- **Acceptance:**
  - [ ] `useCloudText` parametrized: `count`, `seed`, `gameActive` (defaults keep current decorative behavior)
  - [ ] `gameActive` → cloud re-randomizes SPARSE (~20), recenters to (500,500), opacity→1, `pointer-events-auto`
  - [ ] decorative 5s flicker loop disabled while `gameActive`
  - [ ] per-word identity exposed so a word can be clicked / glowed / shattered
  - [ ] decorative cloud UNCHANGED when `gameActive` is false (no regression)
  - [ ] `tsc --noEmit` clean
- **Tests:** visual — toggle gameActive in the real shell; cloud transforms; console-log word clicks fire
- **Notes:** done @ 12cfc07. Verified real /portfolio: game mode = 20 non-overlap words, centered, hero hidden, clickable. Defaults preserve decorative cloud. TEMP dev toggle in PortfolioCanvas (remove in T3/T5). T5 risk: scatter region (880x760 in 1000 viewBox) + SVG slice scaling may clip edge words on some aspect ratios — tune in responsive QA.

## T3 — Game loop + HUD + START bracket
- **Status:** [x] done
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
- **Notes:** done @ 26cd5de. Verified real /portfolio: START -> 8 targets scored 1..8 -> end screen 8 -> play again/back OK. Fixes: select-none (text selection on click), START moved to lower-left (was overlapping PORTFOLIO heading). NOTE: dev-only react-scan render boxes (layout.tsx, NODE_ENV!=production) are NOT in prod. T4 turns the plain opacity-fade hit into letter-shatter + adds target glow.

## T4 — Shatter + glow + a11y polish
- **Status:** [x] done
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
- **Notes:** done @ 1cdebe8. New: letterGeometry.ts (+8 tests, verified rotation anchors), CloudWord.tsx (per-word state: decorative|live|hit; <g> rotate + inner <motion.text> CSS transforms). Designed via 3-way panel+judge (caught SVG-attr-vs-CSS-transform snap bug; adv=fs*0.7 not 25.2). Hardened by 5-lens adversarial review (29 agents, 19 refuted / 5 confirmed all fixed): race (wrong-shake clobbering target glow — guarded via isTargetRef + glow x:0; verified target gold even when just-shaken word becomes next target), reduced-motion decorative static, wrong-click opacity dip, keyboard (tabIndex/role/aria-label/Enter+focus scale), aria-live on target pill + end screen. 32 tests green.

## T5 — Hide nav + responsive QA + ship
- **Status:** [x] done
- **Depends on:** T3
- **Acceptance:**
  - [ ] `gameActive` lifted to `PortfolioV2Content`; bottom nav hidden during play, restored on exit
  - [ ] fully responsive + touch: playable at ~390 (mobile) and desktop; tap targets adequate
  - [ ] no horizontal overflow; end screen + ✕ reachable on mobile
  - [ ] verified in the REAL PortfolioV2Content shell (Playwright, DOM-click nav) at desktop + mobile
  - [ ] `tsc --noEmit` + unit tests green; committed; deployed; live-verified on `/portfolio`
- **Tests:** multi-width screenshots in the real shell; live-site check
- **Notes:** built @ 809d116. Nav-hide via onGameActiveChange callback (lifted gameActive to PortfolioV2Content) + arrow-key nav disabled during play. Responsive: 'meet' (fixed portrait clipping) + portrait viewBox 560x1000; scatterWords made aspect-aware (cols from widest word; vertical only when cell height allows). Verified real shell: mobile words 14->32px, 20/20 on-screen, 0 overlaps, target on board, START 112x160, end screen fits; desktop unchanged. tsc + 32 tests + production build green. PENDING: deploy gate (merge to main → Vercel).

---
**Closeout:** after all tasks — tsc + unit tests green, commit(s) pushed to main
(Vercel auto-deploys), live-verify on fiez.dev/portfolio. Show before/after +
the game running. Update journal.md with any bug-loop entries.
