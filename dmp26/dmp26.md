# DMP'26 Work Log: Anirudh Sharma (`its-me-ani` / `anisharma07`)

**Program:** C4GT Dedicated Mentoring Program 2026 (DMP'26)
**Project ticket:** [seetadev/ZKMedical-Billing#48](https://github.com/seetadev/ZKMedical-Billing/issues/48): ZK Medical Billing Module for Verifiable & Privacy-Preserving Healthcare on IPFS and Filecoin, Optimism & Starknet
**Mentor org repo:** https://github.com/seetadev/ZKMedical-Billing
**Period covered:** 11 June 2026 – ongoing
**Log compiled:** 3 October 2026

## Key Deployments:

### Socialcalc Module and MCP
https://socialcalcainative.vercel.app/

### Aspiring Apps (Socialcalc Apps Website)
https://aspiring-apps.duckdns.org/

### Demo Videos
https://drive.google.com/drive/folders/1R66HSsZKYa8wnvluf2I2_9XJvl5rE5e5?usp=drive_link

---

## 1. Summary

Over the cohort, the work grew from single offline healthcare apps into one connected system:

1. **Offline-first SocialCalc apps with IPFS backup.** Medical Invoice, Patient Sheet, Medical Suite, Medical Notes, Patient Register, Immunization Log, Medical Requisition Form and Headache Log. Each one can pin sheets, PDFs and CSVs to IPFS through Pinata or MeshKit.
2. **Automation for 50+ app variants.** Scripts for rebranding, icon and asset generation, and App Store screenshots. Legacy iOS apps were upgraded and sent to the App Store.
3. **SocialCalc MCP server** (`socialcalc-mcp` on npm). Gives AI clients 35+ spreadsheet tools.
4. **Agentic invoice generation.** Invoice Agent MVPs that use IPFS, MCP and Bedrock/Gemini.
5. **`socialcalc-ai` npm package.** The legacy SocialCalc engine rebuilt as ES6 modules with plugins, TypeScript types, an AI agent plugin, and PDF and share plugins.
6. **Medical-Invoice-Suite.** Moved to Ionic 8, React 19 and Capacitor 8. Added Firebase auth and sync, StoreKit subscriptions, custom templates, PDF fixes and 14 Playwright E2E specs.
7. **Production backend with multiple microservices on AWS EC2** (`aspiringapps_backend`, live at https://aspiring-apps.duckdns.org):
   - Cloudmain
   - Agent Service
   - Apps Service (files, subscriptions and AI quotas on MongoDB Atlas)
   - Ionic web portal
   - MeshKit IPFS service
   - Aspiring Website
   - Aspiring mcp service
   - Nginx with SSL, run by systemd
8. **Aspiring MCP.** A remote MCP server with OAuth 2.1. It connects a user's AspiringApps account to Claude, Gemini and other LLM apps, so they can create and edit invoices and other files from templates.

### Numbers at a glance

| Metric | Value |
|---|---|
| PRs to `seetadev/ZKMedical-Billing` | 8 (#97–#101, #103, #105, #106): 3 merged, 5 open |
| Progress issues filed | 4 (#95, #96, #102 mid-point, #104) |
| npm packages published | 2: `socialcalc-mcp` (v1.0.6), `socialcalc-ai` (v1.0.9) |
| App variants covered by automation | 50+ (7+ healthcare) |
| Healthcare apps built or updated | 10+ |
| SocialCalc MCP tools | 35 at mid-point, extended with design tools later |
| App template packs served to AI via Aspiring MCP | 60 apps, 123 templates tested |
| E2E Playwright specs (Medical-Invoice-Suite) | 14 |
| Live deployment | https://aspiring-apps.duckdns.org |

---

## 2. Timeline

| Dates | Phase | Main output | Tracked in |
|---|---|---|---|
| 11 Jun – 29 Jun | IPFS MeshKit integration + app automation | Pinata/IPFS in Patient Sheet, Medical Invoice, Medical Suite; asset, screenshot and rebrand pipelines | Issue #95 |
| 29 Jun – 5 Jul | Legacy iOS app launches | Diabetic Plus and Blood Pressure Register upgraded for current Xcode/iOS and prepared for the App Store | Issue #96 |
| 9 Jul | Medical Invoice IPFS module | Full offline app + IPFS backup | PR #97 (merged) |
| 15 Jul | More healthcare apps | Medical Notes, Patient Register, Immunization Log, Medical Requisition Form; IPFS + MeshKit + Pinata | PR #98 (merged) |
| 20 Jul | Repo hygiene | Removed invalid `Name:` path that broke checkout on macOS/Windows | PR #99 (merged) |
| 22 Jul | Headache Log + script fixes + agent design | Headache Log app, `update-app.sh` fixes, Agentic Invoice (RAG + sandbox) design | PR #100 |
| 28 Jul | SocialCalc MCP + SocialFS Agent | `socialcalc-mcp` published; SocialCalc AI Editor architecture | PR #101 |
| **29 Jul** | **Mid-point evaluation** | Mid-point report | **Issue #102** |
| Week 9 (6–12 Aug) | iOS IAP, Firebase, PDF fixes | IAP guide, PDF pipeline fix, encryption architecture, Firebase setup | PR #103, Issue #104 |
| Week 10 (13–19 Aug) | iOS modernization + Invoice Agent IPFS | 4 apps moved to Ionic 8 / React 19 / Capacitor 8; Firebase sync; Invoice Agent MVP IPFS | PR #105 |
| Week 11 (20–26 Aug) | E2E tests, Firebase, MeshKit agent, EC2 | Playwright suite, Firebase in Invoice iOS, MeshKit AES-GCM, Tornado backend on EC2 with SSL | PR #106 |
| 27 Aug – 10 Sep | Invoice-MVP-ios features + `socialcalc-ai` | Firebase cloud, SocialCalc customizer, custom templates, subscriptions, feedback, PDF/print fixes, npm package | Invoice MVP (private to seetadev) |
| 8 – 19 Sep | Production backend | Apps Service (Mongo, IAP verification, quotas), Agent Service copilot endpoints, systemd deploy, portal | `aspiring-apps` repo |
| 15 – 18 Sep | ES6 core modularization | SocialCalc core split from 6 files into 14; runtime, events, pdf-export and share modules; `socialcalc-ai` v1.0.9 | [socialcalc-ai](https://github.com/its-me-ani/Socialcalc-AI-JS-Framework) |
| 18 – 22 Sep | Aspiring MCP | Remote MCP + OAuth server for Claude and Gemini, portal "AI connections" settings | aspiring apps repo |
| 22 Sep – 2 Oct | Medical apps cloud-sync + themes | Cognito auth, cloud save/load, custom themes across Medical Ledger, Hospital Staff Schedule, Medical Checkbook Register; unlimited-files storage architecture in Invoice MVP | aspiringsdgs repos |
| 2 – 3 Oct | Repo consolidation | `socialcalc-ai` repo created under aspiringsdgs org; `socialcalc-mcp` transferred to aspiringsdgs; docs site updated with new URLs | aspiringsdgs/socialcalc-ai, aspiringsdgs/socialcalc-mcp |

---

## 3. Milestones Before the Mid-Point (to 29 Jul 2026)

The full mid-point report is [Issue #102](https://github.com/seetadev/ZKMedical-Billing/issues/102).

### Task 1: Invoice App Updates ✅
- Updated the core Invoice App: offline-first behaviour, PDF/CSV export, SocialCalc templates, docs.
- Fixed build and configuration issues across variants and updated native iOS project settings.
- **Healthcare apps added in the DMP'26 folder:**

  | App | What it does |
  |---|---|
  | Medical Invoice | 5-sheet billing: Information, Check-Up, Tests, Drug, Log |
  | Patient Sheet | Clinical forms, 7 sheets, mobile and tablet layouts |
  | Medical Suite | Patient logs and billing together |
  | Medical Notes | Medication schedule, dosage and symptom logs |
  | Patient Register | Registration, check-ins, departments, appointments |
  | Immunization Log | Vaccination history and next-dose schedule |
  | Medical Requisition Form | Lab requisitions, specimen and test details |
  | Headache Log | Episodes, pain scale, medication; bundle ID `com.aspiring.HeadacheLog` |

- Legacy iOS upgrades for the App Store: [Diabetic Plus](https://github.com/aspiringsdgs/Diabetic-Plus) and [Blood Pressure Log](https://github.com/aspiringsdgs/Blood-Pressure-Log).
- Several apps submitted to Apple App Store review.

### Task 2: App Update Scripts ✅
- **Rebranding engine** (`update-app.sh` + `data.json`). One command patches 19 targets (31 matches):
  - `package.json`, PWA manifests and Capacitor config
  - `Info.plist` and `project.pbxproj`
  - theme tokens and UX copy
- **Asset pipeline.** Builds iOS `AppIcon.appiconset` and splash screens, PWA icons and Android mipmaps from one source image.
- **Playwright screenshot automation.** Multiple device viewports, onboarding traversal, App Store-ready PNGs.
- **Fix:** paths containing a single quote (`DMP'26`) broke the inline Python in the scripts. Values are now passed through `sys.argv`.
- Repos:
  - [IPFS-apps-automation](https://github.com/its-me-ani/IPFS-apps-automation)
  - [apps-automation-with-logo](https://github.com/its-me-ani/apps-automation-with-logo)
  - [Automation-base-app](https://github.com/its-me-ani/Automation-base-app)

### Task 3: IPFS Cloud Integration ✅
- Pinata SDK pinning (`pinJSONToIPFS`) and CID-based retrieval through a configurable gateway.
- Metadata tags (`app`, `invoiceId`, `total`) so pinned files can be filtered by app.
- Hybrid storage: local SQLite or localStorage first, IPFS as backup. Supports JSON, PDF and CSV.
- MeshKit integration. Content addressing makes tampering detectable, because a changed invoice gets a new CID.
- App repos:
  - [patient-sheet](https://github.com/aspiringsdgs/patient-sheet)
  - [medical-invoice](https://github.com/aspiringsdgs/medical-invoice)
  - [medical-suite](https://github.com/aspiringsdgs/medical-suite)
  - [Zk-medical-ipfs-suite](https://github.com/its-me-ani/Zk-medical-ipfs-suite)

### Task 4: SocialCalc MCP ✅
- MCP server with 35 spreadsheet tools, built with TypeScript, `@modelcontextprotocol/sdk` and Zod. Runs JSON-RPC 2.0 over stdio.
- Layers: adapters (SocialCalc, CSV, XLSX) → models (Cell, Sheet, Workbook) → services (formulas, styles) → tools.
- Published on npm as [`socialcalc-mcp`](https://www.npmjs.com/package/socialcalc-mcp), now at v1.0.6.
- Repo: [anisharma07/socialcalc-mcp](https://github.com/anisharma07/socialcalc-mcp)

### Task 5: SocialFS Agent (architecture) ✅
- SocialCalc AI Editor architecture:
  - Sheet Agent (Gemini)
  - Command Agent
  - MCP Agent (Bedrock + Claude)
  - S3 + MongoDB Atlas storage and a Flask backend
- Agentic Invoice Generation design:
  - RAG picks the best template for the prompt.
  - A backend sandbox turns the prompt into SocialCalc commands.
  - The result is rendered in the Ionic editor.
- Repo: [Medical-Invoice-Agent](https://github.com/its-me-ani/Medical-Invoice-Agent)
- Items still open at mid-point: production deployment, user workspace and sync, multi-user collaboration, full cloud agent rollout. Sections 4 and 5 below cover them.

---

## 4. Work After the Mid-Point (30 Jul – 22 Sep 2026)

### 4.1 Week 9: iOS In-App Purchases, Firebase, PDF Export, Encryption
PR [#103](https://github.com/seetadev/ZKMedical-Billing/pull/103) · Issue [#104](https://github.com/seetadev/ZKMedical-Billing/issues/104)

- **iOS IAP and subscriptions**
  - Offline-first entitlement system using `cordova-plugin-purchase` v13 under Capacitor.
  - Sandbox and TestFlight test playbook: App Store Connect metadata, `.storekit` versus sandbox schemes, debugging with the Safari inspector.
- **PDF export pipeline fixes**
  - Row-aware page splitting: page breaks snap to `<tr>` boundaries, so rows are no longer cut in half.
  - `syncCanvases()` copies live JFlot `<canvas>` pixels into the `html2canvas` clone, so charts are no longer blank.
  - Removed the 3-sheet export limit and the blank first page in multi-sheet exports.
- **Encryption architecture**
  - Cloud: AES-256-GCM with the Web Crypto API, key derived from Firebase UID + salt.
  - Local: AES-256-CBC with CryptoJS and a user password.
  - Migration guides to S3 and to PostgreSQL/MySQL.
- **Firebase setup:** Email/Password and Google OAuth, Firestore rules isolating `/users/{uid}/files/{fileId}`, native Google auth on Capacitor.
- **App setup:** Nutrition Tracker bootstrapped; Workout Planner metadata set (`com.aspiring.WorkoutTracker`, v7.0) and theme cleaned up.
- **Repos:**
  - [IOS-Firebase-MVP](https://github.com/its-me-ani/IOS-Firebase-MVP)
  - [socicalc-pdf-fix](https://github.com/its-me-ani/socicalc-pdf-fix)
  - [In-App-Purchase-IOS-MVP](https://github.com/its-me-ani/In-App-Purchase-IOS-MVP)

### 4.2 Week 10: iOS Modernization, Firebase Sync, Invoice Agent IPFS MVP
PR [#105](https://github.com/seetadev/ZKMedical-Billing/pull/105)

- **Four iOS apps moved to Ionic 8, React 19, Vite and Capacitor 8** (Xcode 16 / iOS 18):

  | App | Bundle ID | Version |
  |---|---|---|
  | Swimming Planner | `com.aspiring.SwimmingPlanner` | v2.0.0 |
  | Weight Loss Pal | `com.aspiring.WeightLossPal` | v5.0.0 |
  | Workout Tracker | `com.aspiring.WorkoutTracker` | v7.0.0 |
  | Yoga Planner | `com.aspiring.YogaPlanner` | v2.0.0 |

- **Firebase:**
  - Native Google Sign-In plus Email/Password.
  - Multi-tenant Firestore rules.
  - Offline cache with two-way sync when the device reconnects.
  - Tested on iOS 17/18 simulators and a physical device.
- **Invoice Agent MVP (IPFS):**
  - Pinata pinning with metadata tags.
  - `socialcalc-mcp` called over stdio JSON-RPC.
  - Bedrock (Claude) as the main model, with Gemini as fallback.
  - Pinned invoices paired with hashes so billing records can be verified.
- **Repos:**
  - [Invoice-Agent-MVP-IPFS](https://github.com/its-me-ani/Invoice-Agent-MVP-IPFS)
  - [Invoice-Agent-MVP](https://github.com/its-me-ani/Invoice-Agent-MVP)

### 4.3 Week 11: E2E Testing, Firebase in Invoice iOS, MeshKit Agent, EC2 Deployment
PR [#106](https://github.com/seetadev/ZKMedical-Billing/pull/106)

- **Playwright E2E suite**, first 9 specs:
  - navigation, data retention, file CRUD, limits
  - auth, cloud sync, settings
  - modals, responsive layout
- **Invoice iOS Firebase:**
  - Google and Email auth.
  - Cloud backup of invoices and inventory.
  - Analytics.
  - Uses the Firebase Web SDK inside Capacitor to avoid native linker problems.
  - Compresses images on the client.
- **IPFS MeshKit + agent:**
  - `@ipfs-meshkit/meshkit` Kubo client.
  - Client-side AES-256-GCM, so the storage provider never sees the plaintext.
  - Claude + `socialcalc-mcp` agent for editing invoices with natural language.
- **EC2 deployment of the Tornado backend:**
  - Nginx with 4 worker ports each for backend, website and portal.
  - Let's Encrypt SSL with HTTP→HTTPS redirect.
  - `/htmltopdf` export verified.
- **Repos and links:**
  - [Monthly-Rent-Receipt (E2E)](https://github.com/aspiringsdgs/Monthly-Rent-Receipt)
  - [Invoice-MVP-ios](https://github.com/seetadev/Invoice-MVP-ios)
  - [aspiring-apps](https://github.com/its-me-ani/aspiring-apps)
  - Live site: https://aspiring-apps.duckdns.org/web/home/index.html

### 4.4 Invoice-MVP-ios: Production Features (27 Aug – 17 Sep)
Repo: [seetadev/Invoice-MVP-ios](https://github.com/seetadev/Invoice-MVP-ios) · app version `60.1.0` · Ionic 8 / React 19 / Capacitor 8

| Area | What was built | Doc (in repo `docs/`) |
|---|---|---|
| Firebase cloud | Auth (Email, Google, reset); AES-GCM encrypted Firestore storage at `users/{uid}/apps/invoice-app/files/{id}`; Apple privacy manifest | `FIREBASE_CLOUD_SYNC_INTEGRATION.md`, `firebase-rules.md` |
| Storage | Tiered storage: one Capacitor Preferences record per document plus a metadata index. Removes the 15-file / 5 MB localStorage ceiling and keeps old data readable | `storage-architecture.md`, `storage_code.md` |
| SocialCalc customizer | Users build their own invoice templates. Device-specific built-ins: `100001` for phones, `100002` for iPad/desktop. A single sheet can become a standalone custom template | `device-specific-template-customization.md` |
| Custom templates + subscription | Local custom template store (MSC + `appMapping`). Subscription-aware template choice: Free falls back to built-ins, Pro/Max keep custom | `custom-template-storage-and-subscription.md` |
| IAP 2.0 | Tiers moved from client-only credit packs to AI copilot plans (Basic $2/mo, Pro $20/mo). StoreKit 2. Self-healing reconciler for purchases the backend never heard about. MongoDB is the source of truth | `iap_issues_2.md`, `in-app-purchase-architecture.md`, `in-app-purchase-setup.md` |
| PDF / print | Port of `Base-pdf-fix`: single-sheet, all-sheets and native print; row-aware splitting; `Page X of Y` | `pdf_export_fix.md` |
| Cell editing UX | "Edit modal on allowed cells only" setting; fixes for layout shift and format selection; narrow-column header select and resize fix | `cell-edit-modal-*.md`, `column-header-selection-and-resize-fix.md` |
| Plugin system | Plugin manager, row/column headers with resize, row action popover, horizontal scroll | `SOCIALCALC_MODULAR_PLUGINS.md` |
| `socialcalc-ai` migration | Local SocialCalc fork removed. App now imports from the npm package, with typings and Vitest inlining | `socialcalc-ai-npm-migration.md` |
| New Features modal | Shows each release's walkthrough once | `new-features-modal-integration.md` |
| Other | Feedback form, analytics, storage size calculation, pure-white theme toggle, backend config for the EC2 APIs | — |
| Tests | **14 Playwright specs**: the 9 above plus storage stress, buttons/forms, IAP credits and subscriptions, Customize Invoice page, frontend agent + subscriptions. Vitest unit tests for IAP, StoreKit, backend config and custom templates | `e2e/specs/` |

Also: SDLC document for the SocialCalc integration (`docs/SDLC_SocialCalc_Integration.docx`).

### 4.5 `socialcalc-ai`: SocialCalc as ES6 Modules
Repo: [aspiringsdgs/socialcalc-ai](https://github.com/aspiringsdgs/socialcalc-ai) · npm: [`socialcalc-ai`](https://www.npmjs.com/package/socialcalc-ai), v1.0.9 (18 Sep 2026)

- **Standalone package.** The engine was pulled out of the app into a framework-agnostic ESM package:
  - full `index.d.ts` TypeScript types
  - sub-path exports `socialcalc-ai/pdf-export` and `socialcalc-ai/share`
  - works in Vite, Node and headless setups
- **Core split, Sep 2026.** The core had 6 large files, and three of them had misleading names. It is now 14 focused files. Code was moved verbatim, and line numbers are kept where possible so old references still work:

  | Old file | New files |
  |---|---|
  | `core.js` | `sheet.js`, `render.js`, `touch.js` |
  | `format-number.js` | `format-number.js`, `formula.js`, `formula-functions.js` |
  | `formula.js` (actually the popup widgets) | `popup.js` |
  | `table-editor.js` | `table-editor.js`, `editor-widgets.js` |
  | `spreadsheet-control.js` | `spreadsheet-control.js`, `workbook.js`, `environment.js` |

- **Core reference.** New `socialcalc/core/README.md`, 21 sections:
  - data model and save format
  - command language and recalculation
  - formula engine (109 built-in functions) and number formatting
  - workbooks / MSC and extension hooks
  - recipes, plus a list of engine bugs found while writing it (for example `sort` throws in ESM strict mode because `slast` is never declared)
- **Plugin modules (about 20):**
  - `plugin-manager`, `row-col-headers`, `grid-lines`
  - `touch-scroll`, `horizontal-scroll`
  - `editable-cells`, `history`, `exporters`, `sheets`
  - `invoice`, `formatting`, `logos`, `weight`, `device`
  - new `runtime`, `events`, `pdf-export` (offline PDF), `share` (share, email, print)
- **AI agent plugin (`modules/agent.js`):**
  - `getAgentContext` reads dimensions, editable cells and `appMapping`.
  - Generates prompts and function-calling schemas for Gemini, OpenAI and Claude.
  - `executeAgentActions` turns `SET_CELL`, `SET_CELLS`, `APPLY_MAPPING_DATA` and `RAW_COMMAND` into SocialCalc commands, with undo.
  - `AgentModal` debugger.
- **React/Ionic components:** CellEditModal, HorizontalScrollBar, RowActionPopover, EditableCellsModal, DemoVideosModal, AgentModal, AgentPluginTest.
- **Tests and docs:** Vitest suites (`foundation`, `export-share`, `editable-cells`), a docs site in `docs/`, `AGENTS.md` and `GEMINI.md` contributor guides.
- **Note:** The repo has been moved to [aspiringsdgs/socialcalc-ai](https://github.com/aspiringsdgs/socialcalc-ai) with all commits and the core modularization pushed. npm has v1.0.9.

### 4.6 `tornado_version`: Production Backend (AspiringApps)
Repo: [its-me-ani/aspiring-apps](https://github.com/its-me-ani/aspiring-apps) (private) · Live: https://aspiring-apps.duckdns.org

```
iOS app / Portal / AI apps ──HTTPS──> nginx :443
   ├─ /api/apps/*  Apps Service    :15000-15001  (files, templates, subscriptions, AI quotas)
   ├─ /agent/*     Agent Service   :9000-9001    (AI copilot, Bedrock/Gemini, SocialCalc MCP)
   ├─ /login, /save, /htmltopdf …  Cloudmain  :8000-8003
   ├─ /portal      Ionic Portal    :12000-12001
   ├─ /mcp         Aspiring MCP    :16000
   └─ /            Website         :10000-10003
Apps Service → MongoDB Atlas, S3, Cognito JWKS, App Store Server API
```

- **Cloudmain (Tornado):**
  - S3 virtual filesystem, with an automatic local SQLite fallback when AWS credentials are missing
  - Cognito and DB auth
  - `wkhtmltopdf` HTML-to-PDF with headless setup for Ubuntu 24.04
  - collaboration relays (`/broadcast`, `/updates`)
  - auth bug fixed: `create_user` failures were reported as success
- **Apps Service** (new; Python, MongoDB Atlas):
  - Endpoints:
    - `/api/apps/{app}/files` and `/templates` for cloud files and custom templates
    - `/subscription` for subscriptions verified with the App Store Server API
    - `/api/apps/appstore/notifications` for App Store Server Notifications v2 (renewals, refunds, cancellations)
    - `/usage/quota`, `/usage/summary` and `/usage/ingest` for AI token quotas
  - Cognito JWT verification. Internal calls use `X-Internal-Key` + `X-User-Id`.
- **Agent Service** (Tornado + LangChain):
  - Endpoints:
    - `/agent/generate` and `/agent/status/{id}` for full workbook generation from a prompt
    - `/agent/socialcalc/actions` for a copilot that turns `getAgentContext()` into SocialCalc actions
    - `/agent/files` and `/agent/user/apps`
  - Bedrock (Claude, Kimi) with Gemini fallback.
  - Quota check before the model runs, then token reporting to Apps Service. It fails closed.
  - Generation cache.
  - Instruction packs for 60 apps (`app-intent.md`, `theme.json`, phone and tablet templates).
- **SocialCalc MCP** inside the agent service, extended with design tools: `build_sheet`, `build_workbook`, `insert_table`, `insert_kpi_cards`, …
- **Ionic Portal** (`ionic-portal/`, React 19 + Ionic 8 + `socialcalc-ai`):
  - App store and app details pages
  - Spreadsheet editor
  - Agent generator page
  - Amplify/Cognito login, Firebase portal login
  - "My templates" list and Settings → AI connections
- **MeshKit service** (`meshkit-service/`, Node + `@ipfs-meshkit/meshkit`): `/putJSON`, `/getJSON/:cid` and `/putFile` for IPFS storage over an S3-compatible API.
- **Operations:**
  - systemd units under `aspiring-backend.target`
  - `preflight_check.py` and `smoke_test.sh`
  - deploy waits for health checks
  - MongoDB password redacted in logs
  - Let's Encrypt SSL, trailing-slash redirects, privacy policy routes
  - token and agent dashboards
  - guides: EC2, AWS, DuckDNS, PDF export, instance management

### 4.7 Aspiring MCP: AspiringApps for Claude, Gemini and LLM Connector Marketplaces
Path: `tornado_version/aspiring-mcp` (renamed from `claude-connector` on 22 Sep) · Endpoint: `https://aspiring-apps.duckdns.org/mcp`

- **What it is.** A remote MCP server (Node, Streamable HTTP, port 16000). Users connect their AspiringApps account to claude.ai, Claude Desktop or mobile, Gemini, and any other OAuth MCP client. The AI can then:
  - list the user's apps
  - create files from app templates
  - fill and design sheets
  - save to the user's S3 folder, where the files appear in the portal
- **Its own OAuth 2.1 server:**
  - Dynamic client registration, limited to Claude's callback URLs.
  - PKCE S256, refresh-token rotation and revocation.
  - Sign-in goes through the Cognito hosted UI.
  - Access tokens are 1-hour HS256 JWTs bound to `/mcp`.
  - Refresh tokens last 30 days and are stored only as SHA-256 hashes.
- **Gemini and other apps:**
  - Each user gets a personal client ID and secret in portal Settings → AI connections, which can be regenerated.
  - Clients are bound to their owner: signing in with another account through them is refused.
  - Callbacks on trusted AI hosts are accepted.
  - Supports `client_secret_basic` and `client_secret_post`.
- **Tools:**
  - `list_my_apps`, `get_app_templates`, `list_files`
  - `create_file_from_template`, `create_custom_template`, `list_custom_templates`
  - `view_sheet`, `insert_image`
  - the SocialCalc MCP read, edit and design tools; every edit is saved back to S3
- **Safety:**
  - ownership is checked on every call
  - no file-system tools and no delete
  - path-like IDs are rejected
  - `batch_execute` only runs tools on an allowlist
- **App catalog:** 60 app packs synced from agent instructions and the portal index (`npm run sync-apps`).
- **Tests:** OAuth flow, the tools, and all 123 templates through the SocialCalc MCP.
- **Status:** works end to end with Claude as the "AspiringApps" custom connector. Gemini flow built but not yet tested against real Gemini. Not committed yet.

---

## 6. Repositories and Packages

### Mentor org and apps
| Repo | Purpose |
|---|---|
| https://github.com/seetadev/ZKMedical-Billing | Main DMP repo (PRs and issues) |
| https://github.com/seetadev/Invoice-MVP-ios | Invoice iOS app |
| https://github.com/aspiringsdgs/patient-sheet | Patient Sheet + IPFS |
| https://github.com/aspiringsdgs/medical-invoice | Medical Invoice + IPFS |
| https://github.com/aspiringsdgs/medical-suite | Medical Suite + IPFS |
| https://github.com/aspiringsdgs/Diabetic-Plus | Legacy iOS upgrade |
| https://github.com/aspiringsdgs/Blood-Pressure-Log | Legacy iOS upgrade |
| https://github.com/aspiringsdgs/Monthly-Rent-Receipt | Playwright E2E suite |

### Personal (`its-me-ani`)
| Repo | Purpose |
|---|---|
| https://github.com/its-me-ani/ZKMedical-Billing | Fork used for PRs |
| https://github.com/its-me-ani/IPFS-apps-automation | Rebrand, asset and screenshot automation |
| https://github.com/its-me-ani/apps-automation-with-logo | Icon and logo generation |
| https://github.com/its-me-ani/Automation-base-app | Automation base app |
| https://github.com/its-me-ani/Zk-medical-ipfs-suite | Medical IPFS suite |
| https://github.com/its-me-ani/Medical-Invoice-Agent | Agentic invoice (RAG + sandbox) |
| https://github.com/its-me-ani/Invoice-Agent-MVP | Invoice Agent MVP |
| https://github.com/its-me-ani/Invoice-Agent-MVP-IPFS | Invoice Agent + IPFS/MeshKit + MCP |
| https://github.com/its-me-ani/IOS-Firebase-MVP | iOS Firebase auth + sync |
| https://github.com/its-me-ani/In-App-Purchase-IOS-MVP | iOS IAP MVP |
| https://github.com/its-me-ani/socicalc-pdf-fix | PDF export fix |
| https://github.com/aspiringsdgs/socialcalc-ai | `socialcalc-ai` package source (moved to aspiringsdgs) |
| https://github.com/its-me-ani/aspiring-apps (private) | Tornado backend, agent, apps service, portal, MCP |

### Personal (`anisharma07`)
| Repo | Purpose |
|---|---|
| https://github.com/aspiringsdgs/socialcalc-mcp | SocialCalc MCP server source (transferred to aspiringsdgs) |

### npm
- https://www.npmjs.com/package/socialcalc-mcp (v1.0.6)
- https://www.npmjs.com/package/socialcalc-ai (v1.0.9)

### Live
- https://aspiring-apps.duckdns.org: website, portal (`/portal`), MCP (`/mcp`)

---

## 7. PR and Issue Index (DMP'26)

| # | Type | Date | State | Title |
|---|---|---|---|---|
| [95](https://github.com/seetadev/ZKMedical-Billing/issues/95) | Issue | 21 Jun | Open | Contributions 11 Jun – 29 Jun: IPFS integration with medical apps on SocialCalc |
| [96](https://github.com/seetadev/ZKMedical-Billing/issues/96) | Issue | 29 Jun | Open | Contributions 29 Jun – 5 Jul: IPFS apps launches |
| [97](https://github.com/seetadev/ZKMedical-Billing/pull/97) | PR | 9 Jul | Merged | feat: add DMP'26 med invoice ipfs project |
| [98](https://github.com/seetadev/ZKMedical-Billing/pull/98) | PR | 15 Jul | Merged | IPFS MeshKit integration & medical apps update |
| [99](https://github.com/seetadev/ZKMedical-Billing/pull/99) | PR | 20 Jul | Merged | fix: remove invalid path file `Name:` and fix Patient-register filings |
| [100](https://github.com/seetadev/ZKMedical-Billing/pull/100) | PR | 22 Jul | Open | Headache Log, Medical Notes on IPFS and AI integration |
| [101](https://github.com/seetadev/ZKMedical-Billing/pull/101) | PR | 28 Jul | Open | SocialCalc MCP Server and SocialFS Agent |
| [102](https://github.com/seetadev/ZKMedical-Billing/issues/102) | Issue | 28 Jul | Open | DMP'26 mid-point contribution |
| [103](https://github.com/seetadev/ZKMedical-Billing/pull/103) | PR | 6 Aug | Open | [Week 9] iOS IAP, Firebase save/auth, PDF export fixes |
| [104](https://github.com/seetadev/ZKMedical-Billing/issues/104) | Issue | 12 Aug | Open | [Week 9] Cloud auth, subscription & PDF export |
| [105](https://github.com/seetadev/ZKMedical-Billing/pull/105) | PR | 19 Aug | Open | [Week 10] iOS modernization, Firebase sync, IPFS Invoice Agent MVP |
| [106](https://github.com/seetadev/ZKMedical-Billing/pull/106) | PR | 26 Aug | Open | [Week 11] E2E testing, Firebase, IPFS agent workflows, EC2 deployment |


