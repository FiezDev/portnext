# Architecture — riceguard-portfolio-harden

**Chosen approach:** Minimal-diff — edit static data + add one small render
filter; do image work out-of-band (Pillow/Playwright) and drop results into
`public/screenshot/`. No new components, no schema changes beyond reusing the
existing optional fields. (Single obvious approach; no fan-out — Claude/self
only per project rule.)

## Key decisions
- **NT-TagID hide = render filter on `activeFlag`.** `WorkProjectObj.activeFlag`
  already exists. Add `.filter((p) => p.activeFlag !== false)` to the three
  render sites — `WorkContent.tsx`, v2 `ProjectsSection.tsx`, v1 `Works.tsx` —
  then set NT-TagID `activeFlag: false`. Data stays in `projectMock.ts`; it just
  never renders. (Default-true semantics: only an explicit `false` hides, so all
  other projects are unaffected.)
- **Blur = real pixel box-blur via Pillow.** For each RiceGuard dashboard PNG,
  view it, identify the rectangles holding identifiable text (farm/region names,
  device/run IDs, alert counts, model names, internal domains), apply
  `ImageFilter.GaussianBlur`/pixelation to those crops, paste back, overwrite the
  file. Not a CSS overlay — the pixels are destroyed so nothing is recoverable.
- **AWS diagram = generated, sanitized.** Author a clean self-contained HTML/CSS
  (or SVG) diagram of the data flow (telemetry → MQTTS/NLB → RabbitMQ → API/EC2 →
  Postgres; static dashboards behind ALB; S3 backups; region label only), render
  with headless Chrome → PNG. NEVER reuse the repo's `iso15-integration-aws.png`
  (may leak detail) and NEVER print account/resource IDs, key names, or paths.
- **VV reference-image capture = Playwright on the live app.** Load
  `qms.nttagid.com/vehicle-verifier?id=<n>`, open the Reference Images panel,
  select a Make (native `<select>`, options Ford/Isuzu/Mazda/…) so the reference
  photo grid populates, screenshot. Repeat for 1-2 makes. No Report tab.
- **Stack + copy** edited inline in `projectMock.ts`; each card gains a
  product-AI line (never "built with Claude Code").

## Alternatives considered
- Add a dedicated `hidden?: boolean` field — rejected: `activeFlag` already
  exists and reads naturally; fewer type changes.
- CSS/overlay redaction on screenshots — rejected: not real blur; data still in
  the file and recoverable.

## Constraints inherited from exploration
- Images must live under `public/screenshot/` (shipped by the static export via
  `resolveImageSrc`).
- Side cards read `pic?: string[]`; work cards read `projectPic.picurl.pic[]`.
- `tsc --noEmit` must stay green after each task.
- No AWS account/resource IDs, SSH key names, or credential paths in any output.

## Open questions / risks
- Blur coordinates are per-image and hand-picked from a visual read; risk =
  missing a sensitive string. Mitigation: re-view each blurred PNG before commit;
  when in doubt, blur the whole region.
