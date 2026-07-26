# spec.md — riceguard-portfolio-harden

> **Immutable.** If something here changes, the interview phase ran again.

## Objective
Correct and harden 6 portnext portfolio projects in `src/mocks/projectMock.ts`
(+ minimal render code) so RiceGuard reflects the real TS/dashboard/API/AWS-infra
work with nothing sensitive leaked, NT-TagID is hidden (data kept), Vehicle
Verifier shows its reference-image feature, and every project notes the
product-AI it uses. Claude/self only — no Codex/Gemini/GLM.

## Tasks
1. **RiceGuard** — replace wrong stack (React Native/C++/ESP32/Rust/Python) with
   real work: `TypeScript · Next.js · React · Apollo · GraphQL · Bun · Node ·
   PostgreSQL/TimescaleDB · RabbitMQ(AMQP) · MQTT · Zod · AWS · Docker ·
   GitHub Actions · Caddy/Nginx`. Remove `riceguard-mobile-pest.png`. Keep
   admin/aiops/analytics shots but REAL pixel box-blur (Pillow) all identifiable
   data. Generate a FRESH SANITIZED AWS architecture diagram (no IDs) and add it
   to the carousel. Add a short infra write-up + product-AI line.
2. **NT-TagID** — add an `activeFlag` render filter to `WorkContent.tsx`, v2
   `ProjectsSection.tsx`, v1 `Works.tsx`; set NT-TagID hidden (keep all data);
   add its AI line.
3. **Vehicle Verifier** — capture the LIVE app reference-image feature
   (`qms.nttagid.com/vehicle-verifier?id=50…`: select a make so reference photos
   populate). Add those shots. NO Report tab. Add AI line.
4. **AtEasePlatform, ORG-TOOLS, Image Crawler** — add a product-AI line each.

## Real AWS infra (ap-southeast-7) — describe high-level only
VPC w/ public+private subnets ×2 AZ, IGW+NAT, ALB+NLB, 6 SGs, RabbitMQ broker
(MQTTS 8883 / AMQP 5672), API on EC2:3000, Postgres/TimescaleDB, S3 backups,
IAM/SSM, Secrets Manager. AWS-CLI idempotent provisioning. CI/CD GitHub Actions.
Flow: telemetry → MQTTS/NLB → RabbitMQ → API/EC2 → Postgres; static dashboards
behind ALB.

## SENSITIVE — never render in image/text/code
Account `654654475577`; any `vpc-/subnet-/sg-/igw-/nat-/rtb-` IDs; SSH key names;
credential file paths; raw internal hostnames beyond the product domain.

## Product-AI per project (NOT the Claude-Code build)
- RiceGuard: pest/disease detection, soil-NPK, IoT-anomaly, weather + yield
  (XGBoost) prediction, AI-Ops model monitoring, pgvector KB semantic search.
- NT-TagID: face / vehicle recognition.
- AtEase: LLM draft/fact-check/translate, GPT-Image, Seedance video, AI router.
- ORG-TOOLS: LLM ISO-doc generation, knowledge-graph embeddings, Claude/LLM
  integration (as a product feature).
- Vehicle Verifier: AI type/color/make classification + confidence.
- Image Crawler: Roboflow AI-assisted labeling for recognition datasets.

## Constraints
Claude/self only. No AWS IDs/keys/paths anywhere. Never say "built with Claude
Code." Keep NT-TagID data intact (hide render only). `tsc --noEmit` must pass.
Blur must be real pixel blur (not a removable overlay). Push via token-URL
(keychain blocked). Remind to rotate the GitHub PAT at end.

## Success criteria
RiceGuard: accurate TS+AWS tags + all shots blurred (zero identifiable data) +
no farmer shot + sanitized AWS diagram + infra line + AI line. NT-TagID: renders
nowhere, data intact. Vehicle Verifier: reference-image-feature shots added.
All 6 projects carry an AI-participation line. `tsc` clean; pushed live.
