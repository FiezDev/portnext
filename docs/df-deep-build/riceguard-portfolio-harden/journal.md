# Journal

## 2026-06-11 — docs phase
- Doc pack created. Scope option: **Full breakdown** (6 vertical-slice tasks,
  T1–T6), approved as-is by the human.
- Slug: `riceguard-portfolio-harden`.
- Key decisions locked in spec: GitHub is source of truth (`/home/bjgdr` not
  used); AWS infra described high-level only (no IDs); blur via real Pillow
  pixel box-blur; NT-TagID hidden via `activeFlag` render filter (data kept);
  Vehicle Verifier shows reference-image feature (no Report tab); product-AI
  noted per project but never the Claude-Code build.

## 2026-06-11 — plan phase
- Chose **Minimal-diff** approach (only sensible one): static-data edits + a
  single `activeFlag !== false` render filter in 3 spots; image work (Pillow
  blur, generated AWS diagram, Playwright VV captures) done out-of-band into
  public/screenshot/. No design fan-out (Claude/self only; no architectural fork).
- architecture.md written. Proceeding to execute (start T1).

## 2026-06-11 — execute + review
- T1 RiceGuard data @735315b · T4+T6 NT-TagID hide + AI lines @21bd459 ·
  T2 blur @8c92782 · T3 AWS diagram @b96f5b2 · T5 VV reference shots @e568af7.
- Review (self + visual, Claude-only — content/image task, no multi-agent
  fan-out): secret-leak scan over committed src/ + screenshot names = CLEAN
  (no account/resource IDs, key names, paths, farm names, model names, emails).
  All 8 images serve 200. Visual QA: RiceGuard leads with the AWS diagram +
  corrected stack; NT-TagID absent from /work; VV reference-image shots render.
  tsc clean throughout.
- All 6 tasks [x] done. Pushed to main. Status: complete.
