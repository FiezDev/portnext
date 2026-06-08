# Projects Inventory — repos updated in the last year

> Source for refreshing the portfolio **Projects** page.
> Window: pushed since **2025-05-31** (generated 2026-05-31).
> ~101 unique repos (forks deduped). Most org work is private — listed for professional range; link only the public ones.

**Owners:** `go-thailand` (work org @ Mobile AI Co — 72 repos) · `Mobile-AI-Co-Ltd-0105567015509` (mostly forks of go-thailand — 3 originals) · `FiezDev` (personal — 27 repos)

---

## ⭐ Public / linkable (best portfolio candidates)

| Repo | Lang | What it is |
|---|---|---|
| [portnext](https://github.com/FiezDev/portnext) | TypeScript | This portfolio site (Next.js 16, R3F 3D v2) |
| [artemis-oracle](https://github.com/FiezDev/artemis-oracle) | Python | Oracle-family AI watcher agent |
| [shared-memory](https://github.com/FiezDev/shared-memory) | Shell | Shared cross-agent memory system |
| [git-doc](https://github.com/FiezDev/git-doc) | TypeScript | Summarize your yearly git work across repos |
| load-test-script (go-thailand) | Python | Inspur GPU test script (public) |

---

## 🔒 Personal projects (FiezDev, private — yours to showcase)

**AI / agent systems**
- **QuadOne** (`quadone`, TS) — AI inbox triage for solo knowledge workers
- **zenith-oracle** / Oracle family — AI agent identity + memory framework
- `claude-dynamic-multi-agent` (Python) — multi-agent orchestration
- `aichatbot-langchain-nextjs` (TS) — LangChain + Next.js chatbot
- `claude-code-setup` (Shell) — Claude Code environment setup
- `jira-fetch` (TS) — Jira integration tooling

**Products / platforms**
- **AtEase** — `AtEasePlatformv2`, `AtEasePlatform`, `at-ease-shop` (TS) — platform + storefront
- **QOne** — `qone_corp`, `qone_company` (TS/Python)
- `rizzup-backoffice-develop` (TS) — back-office app
- `flow-account-middleware` (TS) — FlowAccount (Thai accounting) integration
- `paperclip` (TS), `engineering` (TS), `dashboard` (HTML), `ironclaw-home` (JS)
- `comfyui-gfx1151` (Shell) — ComfyUI on gfx1151 GPU
- `VUE_POC` (Vue), `git-doc` (TS, public)

---

## 🏢 go-thailand — professional work (private), grouped by initiative

### RiceGuard — agritech IoT + AI crop-monitoring platform (~20 repos)
Smart rice-crop monitoring: pest/disease detection, sensor telemetry, edge AI.
- **API/core**: `Rice-Guard-API` (TS), `riceguard-kb-api` (Bun+Elysia+GraphQL), `riceguard-knowledge-base` (Python AI pipeline), `RG_reccomend`
- **Dashboards**: `riceguard-admin`, `riceguard-analytics`, `riceguard-aiops` (model monitoring/anomaly), `riceguard-monitor`, `command-center-dashboard`, `riceguard-farmer`
- **Mobile/LIFF**: `riceguard-farmer-app` (React Native), `riceguard-survey-liff` (Svelte/LINE)
- **IoT/edge**: `riceguard-firmware` (ESP32 C++/PlatformIO), `riceguard-mqtt-bridge` (Bun), `riceguard-bot-orchestrator` (Rust async MQTT), `riceguard-jetson` (Jetson Nano OTA), `riceguard-sysinfo`
- **Shared/infra**: `riceguard-shared-ui`, `riceguard-sentinel-poc`, `rc_ml_batch_pipeline` (Linux batch ML)

### STAR Search Engine — vehicle/person recognition AI (~20 repos)
License-plate + vehicle + person-attribute recognition, search & labeling.
- **Recognition models**: `vehicle-classifier` (color/model), `LDR_Opol_v2`, `LDR_Opol_V1`, `LDR_final_V1`, `LDR_finetune`, `LPR_MLAIS240` (license-plate), `personattributes`, `Enhanced-Recognition-Application`, `huggingface-cloth-segmentation`, `mpe_clothes_and_persons`, `MobileAI-MPE`
- **Apps/UI**: `vehicle-verifier`, `vehicle-label` (labeling tool), `Vehicle-Detection-Frontend`/`-Backend`, `ui-star-search-engine`, `query-processing-star-search`, `face-search-reactjs`
- **Data/infra**: `crawler-labelling` (Roboflow), `Camera-Recording-API`, `GPU-Load-Balancing`, `Feed-Streaming`, `Upload-Server`, `Redis-Caching-API`, `S3Dumper-Local`, `MobileAI-Faces-Datasets`, `load-test-script` (public)

### Thailand TagID — NT TAG ID system (~9 repos)
- `Thailand-TagID-API` (Rust), `Thailand-TagID-Web` (Svelte), `Thailand-TagID-Mobile` (Svelte)
- `nt-tag-id-frontend`/`-backend`/`-frontend-v2` (Vue/JS), `tagidproject`, `etl_analytics` (Django ETL), `DataForWilson`

### Thailand Pass (2 repos)
- `thailandpass-admin` (Vue), `thailandpass-api` (PHP Laravel)

### Other go-thailand work
- **Queue Mgmt (STAR SE)**: `qms-core` (PHP), `qms_api` (TS), `queue-management-system`
- `DAD-Asset-Management-System` (TS) — asset management
- `currency-conversion-service` (TS microservice), `incident-noti-service` (Rust)
- `vnstat-dashboard` (bandwidth monitor for CCTV), `n8n-server`, `pdf-generator`, `react_base_template`, `Core-API-Migration`, `extractor_monitors`, `pyrus_sr` (Python+Rust ML), `Opol_Update1`, `CE`

---

## Suggested Projects-page refresh (maps to `WorkProjectObj`)

Top professional headliners to add (replace/augment the 2022–23 entries):

1. **RiceGuard Platform** — agritech IoT + AI · `TypeScript, Bun, Rust, C++, React Native, GraphQL, MQTT, Python`
2. **STAR Search Engine** — vehicle/person recognition AI · `Python, PyTorch, Roboflow, Redis, React`
3. **Thailand TagID** — national tag-ID system · `Rust, Svelte, Vue, Django`
4. **Thailand Pass** — travel pass system · `Vue, PHP/Laravel`
5. **QuadOne** — AI inbox triage · `TypeScript, Next.js, LLMs`
6. **AtEase Platform** — `TypeScript, Next.js`
7. **Oracle / Zenith** — multi-agent AI framework · `Python, TypeScript`

> Each needs: `projectName`, `projectIntro`, `projectDesc[]`, `stack[]`, `projectType` (Work/Side), `status`, `projectPic`. Most org repos are private → no public link; present as professional work with a screenshot or description only.
