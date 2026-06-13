# Journal

## 2026-06-12 — docs phase
- Doc pack created for the Hero Word-Hunt game. Slug: `word-hunt`.
- Scope option chosen by human: **Full breakdown — 4–5 tasks**.
- Central constraint locked in interview: **reuse the existing hero word cloud**
  (`useCloudText` SVG) as the game board — not a new cloud.
- Other locked decisions: total focus mode (hide nav too, ✕ exits); sequential
  single targets; shake-only on wrong click; end = score + best + replay/back
  (no rank); ~20 sparse words; lightweight per-letter shatter + gold glow ramp;
  fully responsive + reduced-motion; logic unit tests + visual QA in the REAL
  shell. "Fast to render" is a hard constraint.
- Delegation: Claude/self only (no Codex/Gemini/GLM) per standing preference.

## 2026-06-12 — plan phase — chose "reuse cloud + seeded sparse scatter"
- Explored cloud internals + shell state (2 Claude Explore agents). Findings in
  context.md (## Exploration).
- Architecture locked (architecture.md): gameActive in PortfolioV2Content; reuse
  useCloudText/PortfolioCanvas SVG render; game mode = seeded sparse scatter
  (mulberry32) centered + clickable; glow via dead highlightColor/shouldGlow
  fields; per-letter pre-rotated shatter; timer via setTimeout(15s)+1s tick+CSS
  bar; reduced-motion fallback; hide nav via conditional render; hide hero via
  opacity toggle. Human picked: seeded sparse scatter helper.
- Surprises folded in: no jest config (T1 adds next/jest); in-render Math.random
  jitter bug (precompute anim timing); radialPacking packs tight (hence sparse
  helper); highlightColor/shouldGlow are dead fields (free glow hooks).
- Next: execute T1 (pure logic + tests, incl. jest setup) and T2 (cloud transform).

## 2026-06-12 — exec — T1 + T2 done
- T1 @ b35829a: heroGameLogic.ts + 24 jest tests green; added next/jest config (none existed).
- T2 @ 12cfc07: useCloudText parametrized {count,seed,gameActive}; reuse cloud as sparse centered clickable board; precomputed anim timing (killed in-render Math.random jitter); flicker disabled in game. Verified in real shell.
- Playwright gotcha: not installed in portnext/zenith; ran verification from a scratch /tmp/pw npm project (playwright@1.60, browsers cached). Reusable for T3–T5.
- Checkpoint before T3 (game loop + HUD + START).

## 2026-06-12 — exec — T3 done @ 26cd5de
- Playable loop complete: START bracket + useHeroGame + GameHUD wired into PortfolioCanvas. Verified 8 hits scored 1..8 + end screen in real shell.
- Found a clean spot for START (lower-left) — vertical-center overlapped the PORTFOLIO heading. select-none added (clicking words was selecting text).
- Identified the purple "box + ×N" overlay as dev-only react-scan (unpkg script gated by NODE_ENV!=='production' in layout.tsx) — not a shipping artifact. Useful signal that cloud words re-render on timer ticks (cheap; precomputed anim timing means no animation restart).
- Checkpoint before T4 (shatter + glow + a11y).

## 2026-06-12 — exec — T4 done @ 1cdebe8 (ultracode: panel + adversarial review)
- Design panel workflow (3 lenses + judge): picked CloudWord extraction; surfaced the load-bearing bug — word transform=rotate is an SVG ATTRIBUTE but framer writes shake/hover to CSS transform which OVERRIDES it → rotated words snap upright. Fix: <g rotate> wrapper + inner <motion.text>. Also adv=fontSize*0.7=21 (architecture.md's 25.2/fs36 was stale).
- TDD: letterGeometry.test.ts (verified anchors R=0/90/180/270) RED→GREEN before the component.
- Adversarial review workflow (5 lenses, find→verify; 29 agents): 19 false alarms refuted (strict-mode stuck fragments, Safari filter, whileHover slingshot, two-gold-targets flash, etc.), 5 confirmed + fixed: (1) wrong-shake settle clobbered a just-assigned target glow → grey [race, fixed+verified]; (2) decorative ignored reduced-motion; (3) no keyboard affordance; (4) wrong-click color-only under reduced; (5) no SR live region.
- Verified in real shell: gold glow ramp, gold letter shatter (self-prunes, no leak), red shake, rotation preserved through <g>, keyboard Enter scores, reduced-motion fallbacks. react-scan dev overlay (NODE_ENV!=prod) blocked via route abort for clean screenshots.
- Remaining: T5 (hide nav during play + responsive/mobile QA + ship).

## 2026-06-12 — exec — T5 built @ 809d116 (awaiting deploy gate)
- Focus mode: bottom nav slides away during play (onGameActiveChange → PortfolioV2Content), arrow-key nav disabled mid-game.
- Responsive fix: 'slice' clipped the wide scatter on portrait phones → switched game to 'meet' + a portrait viewBox (560x1000). Made scatterWords aspect-aware (cols sized to widest word; rotate vertical only when cell height fits) so no overlap in any aspect. Kept count=20 so useHeroGame + cloud share the word set.
- Verified real shell: mobile words 14px→32px (touch-friendly), 20/20 on-screen, 0 overlaps, target always on board, START 112x160 tappable, end screen fits 2 buttons; desktop unchanged. tsc + 32 tests + `next build` all green.
- Branch feat/hero-word-hunt: T1 b35829a, T2 12cfc07, T3 26cd5de, T4 1cdebe8, T5 809d116. Not pushed — awaiting user deploy decision.
