# context.md — riceguard-portfolio-harden

Seeded from interview recon. Later phases append findings below.

## Files / sources read during recon
- `src/mocks/projectMock.ts` — RiceGuard (WorkProject id8) + NT-TagID (id7)
  entries; current RiceGuard stack/pics are wrong (farmer/firmware tech).
- Render path: `src/components/WorkContent.tsx` (sorts WorkProjects, **no**
  activeFlag filter), `src/components/portfolio/v2/sections/ProjectsSection.tsx`
  (work/side toggle, sorts, no filter), `src/components/portfolio/v1/projects/
  Works.tsx` (destructures activeFlag but doesn't filter). `activeFlag` exists on
  `WorkProjectObj` (`src/types/object.ts:50`) — currently unused for hiding.
- `resolveImageSrc` (`src/lib/utils.ts`) — local `/screenshot/...` paths serve
  directly and ship with the static export.
- ~30 RiceGuard repos across `go-thailand` + `Mobile-AI-Co-Ltd-0105567015509`.
  Yours: `riceguard-admin`, `riceguard-aiops`, `riceguard-analytics`,
  `Rice-Guard-API`, `riceguard-mqtt-bridge`, `riceguard-kb-api`,
  `riceguard-sysinfo` + AWS infra. NOT yours: `riceguard-firmware` (C++/ESP32),
  `riceguard-farmer`/`-farmer-app` (React Native), `riceguard-bot-orchestrator`
  (Rust sim), `riceguard-knowledge-base`/`RG_*` (Python ML).
- `Rice-Guard-API/infra/aws/` — `PHASE-A-STATUS.md`, `PHASE-B-SECRETS-CATALOG.md`,
  `phase-a-network.sh`, `phase-b-*.sh`, `iam-ssm-operator.json`; plus `Dockerfile`,
  `docker-compose.yml`, `.github/workflows/deploy.yml`, `infra/rabbitmq/`,
  `infra/setup/`, `infra/cleanup/`. Confirms the AWS stack + architecture.

## Patterns to follow
- Portfolio data is static in `projectMock.ts`; images in `public/screenshot/`.
- Side cards support `pic?: string[]`; work cards use `projectPic.picurl.pic[]`.
- Stack tags + 2-line `projectDesc` per card; keep copy concise and accurate.
- Pillow is available (installed earlier) for real pixel blur. Chrome headless +
  Playwright available for captures. GH token at `/tmp/ghtok` (valid).
- Commit small, push via `git -c credential.helper= push https://x-access-token:<tok>@github.com/FiezDev/portnext.git main`.

## Sensitive-data registry (NEVER render)
Account `654654475577`; `vpc-/subnet-/sg-/igw-/nat-/rtb-` IDs; SSH key names
(`rice_guard_prod`); credential paths (`~/secret/...`, `*.pem`, `*accessKeys.csv`);
farm/region names visible in dashboards (naa khao Carlos Garcia, แปลงทดสอบ
ลาดพร้าว, Phra Nakhon, Songkhla, Roi Et); device/run UUIDs; alert counts; AI model
names (disease-detector-v3, yield-predictor-v2, …); internal hostnames.

## Open questions the human deferred
- None blocking. `/home/bjgdr` box not used (GitHub is the source of truth).
- AWS diagram: generate fresh sanitized (not the repo's iso15 PNG).
