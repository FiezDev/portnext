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
