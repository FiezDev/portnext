# Tasks — riceguard-portfolio-harden

Source of truth for execution order. Status flips inline; agents re-read this on
every entry.

Status legend: `[ ]` todo · `[~]` in-progress · `[x]` done

## T1 — RiceGuard data correction (stack + copy + AI line)
- **Status:** [x] done
- **Depends on:** —
- **Acceptance:**
  - [ ] stack tags = real TS + AWS set (no React Native/C++/ESP32/Rust/Python)
  - [ ] projectDesc has a short AWS-infra write-up (high-level, no IDs) + a
        product-AI line
  - [ ] `riceguard-mobile-pest.png` removed from pic array (+ file git-rm'd)
  - [ ] `tsc --noEmit` clean
- **Tests:** tsc + grep mock for forbidden tags
- **Notes:**

## T2 — Blur RiceGuard dashboard screenshots
- **Status:** [x] done
- **Depends on:** —
- **Acceptance:**
  - [ ] real pixel box-blur applied to farm/region names, device/run IDs, alert
        counts, AI model names, internal domains on overview/admin/aiops/sensors/
        yield shots
  - [ ] no identifiable data legible at full size
- **Tests:** visual review of each blurred PNG
- **Notes:**

## T3 — Sanitized AWS architecture diagram
- **Status:** [x] done
- **Depends on:** —
- **Acceptance:**
  - [ ] clean diagram: telemetry → MQTTS/NLB → RabbitMQ → API/EC2 → Postgres;
        static dashboards behind ALB; S3 backups; ap-southeast-7
  - [ ] NO account/resource IDs, key names, or credential paths
  - [ ] added to RiceGuard carousel
- **Tests:** visual review (no sensitive strings)
- **Notes:**

## T4 — NT-TagID render-hide
- **Status:** [x] done
- **Depends on:** —
- **Acceptance:**
  - [ ] activeFlag filter added to WorkContent + v2 ProjectsSection + v1 Works
  - [ ] NT-TagID hidden everywhere; its data still present in projectMock
  - [ ] NT-TagID AI line added (kept in hidden data)
  - [ ] `tsc --noEmit` clean
- **Tests:** tsc + DOM check NT-TagID absent from /work
- **Notes:**

## T5 — Vehicle Verifier reference-image captures
- **Status:** [x] done
- **Depends on:** —
- **Acceptance:**
  - [ ] live-app shots of the reference-image feature (select make → ref photos)
  - [ ] wired into the Vehicle Verifier card; AI line added
  - [ ] NO Report tab shot
- **Tests:** image serves 200; visual review
- **Notes:**

## T6 — AI-participation lines (AtEase / ORG-TOOLS / Image Crawler)
- **Status:** [x] done
- **Depends on:** —
- **Acceptance:**
  - [ ] each card's projectDesc gains a product-AI line (no "built with Claude Code")
  - [ ] `tsc --noEmit` clean
- **Tests:** tsc + grep mock for the AI lines
- **Notes:**

---
**Closeout:** after all tasks — `tsc` clean, commit(s) pushed to main via
token-URL, remind human to rotate the GitHub PAT.
