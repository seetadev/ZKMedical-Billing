# Blood Sugar Log - MCP Agent with IPFS Integration

An offline-first mobile blood sugar tracking application built with Ionic React and Capacitor. Features an embedded SocialCalc spreadsheet engine for data entry, a Cloud AI Agent powered by Claude (via MCP tools) for natural language editing, and decentralized IPFS storage via Pinata for report persistence and sharing.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Ionic 8 + React 19 |
| Build Tool | Vite 7 |
| Language | TypeScript 5.9 |
| Mobile | Capacitor 8 (iOS + Android) |
| Spreadsheet | Embedded SocialCalc JS Engine |
| AI Agent | Claude (via AWS Bedrock) + socialcalc-mcp tools |
| Storage (Local) | localStorage (offline-first) |
| Storage (Cloud) | IPFS via Pinata API |
| Auth Backend | Flask (SocialCalc-AI server) |
| Charts | Chart.js + react-chartjs-2 |
| PDF Export | jsPDF + html2canvas |
| Testing | Vitest (unit), Cypress (e2e) |

---

## Architecture

```
+--------------------------------------------------+
|                Mobile App (Capacitor)              |
|                                                  |
|  +---------------------------------------------+|
|  |          Ionic React UI Layer                ||
|  |  Pages: Home | Files | Settings              ||
|  |  Modals: CloudAgentPanel, IpfsCloudModal     ||
|  +---------------------------------------------+|
|                      |                           |
|  +---------------------------------------------+|
|  |           Context Layer                       ||
|  |  InvoiceContext (React Context)              ||
|  |  State: selectedFile, templateData, etc.     ||
|  +---------------------------------------------+|
|                      |                           |
|  +---------------------------------------------+|
|  |          Service Layer                        ||
|  |  cloud-agent-service  | ipfs-service         ||
|  |  local-template-service | export services    ||
|  +---------------------------------------------+|
|                      |                           |
|  +---------------------------------------------+|
|  |      Embedded SocialCalc Engine              ||
|  |  (JavaScript, loaded into window.SocialCalc) ||
|  +---------------------------------------------+|
|                      |                           |
|  +---------------------------------------------+|
|  |         Data Layer (localStorage)            ||
|  |  Invoices | Templates | Settings | Auth      ||
|  +---------------------------------------------+|
+--------------------------------------------------+
         |                           |
    IPFS (Pinata)           Flask Backend
    - Pin reports           - Auth (MongoDB)
    - Fetch by CID          - Cloud Agent
    - Gateway access        - IPFS cred sync
                            - Report metadata
```

### Key Integration Flows

#### Cloud Agent Flow (MCP + IPFS)

```
User (voice/text prompt)
    |
    v
CloudAgentPanel.tsx  -->  cloud-agent-service.ts
    |                         |
    |                    POST /api/app-agent/chat
    |                         |
    v                         v
    |                 Flask Backend (AppAgentHandler)
    |                         |
    |                    1. Load blood sugar template
    |                    2. Write to temp file
    |                    3. Start MCP server (socialcalc-mcp)
    |                    4. Claude (Bedrock) edits via tools (15 turns max)
    |                    5. Pin final report to IPFS (Pinata)
    |                    6. Store metadata in MongoDB
    |                         |
    v                         v
CloudAgentPanel  <--  { cid, url, message, report }
    |
    v
User can: copy CID, open in gateway, load into editor
```

#### Direct IPFS Flow (Client-Side)

```
User
    |
    v
IpfsCloudModal.tsx  -->  ipfs-service.ts
    |                        |
    |                   Pinata API (direct)
    |                   - pinJSONToIPFS
    |                   - testAuthentication
    |                   - Fetch via gateway
    |                        |
    v                        v
Import file by CID / Export current file to IPFS
```

---

## Code Structure

```
BloodSugarLog/
├── package.json                    # Dependencies, scripts
├── capacitor.config.ts             # Capacitor: appId, server config
├── vite.config.ts                  # Vite: dev server (port 3000), build config
├── tsconfig.json                   # TypeScript configuration
├── vitest.config.ts                # Vitest: jsdom environment, coverage
├── ionic.config.json               # Ionic CLI config
│
├── public/
│   ├── SocialCalc.js               # Legacy monolithic SocialCalc (fallback)
│   └── templates/                  # Built-in report templates
│       ├── meta/                   # Template metadata JSON
│       └── data/                   # Template data JSON (mobile.json, tablet.json)
│
├── src/
│   ├── App.tsx                     # Root: routing, error boundary, tab navigation
│   ├── main.tsx                    # Entry: data layer init, status bar setup
│   │
│   ├── pages/
│   │   ├── SocialCalcPage.tsx      # Main editor page (embedded SocialCalc)
│   │   ├── DashboardHome.tsx       # Home/dashboard
│   │   ├── FilesPage.tsx           # File management
│   │   ├── SettingsPage.tsx        # Settings + authentication UI
│   │   └── OnboardingPage.tsx      # Welcome/onboarding flow
│   │
│   ├── components/
│   │   ├── CloudAgentPanel.tsx     # MCP Cloud Agent modal (voice + text)
│   │   ├── IpfsCloudModal.tsx      # IPFS credentials + file manager
│   │   ├── DashboardLayout.tsx     # Dashboard wrapper layout
│   │   ├── InvoiceForm.tsx         # Data entry form
│   │   ├── Files/Files.tsx         # File list component
│   │   └── InvoicePage/            # SocialCalc editor components
│   │       ├── CellEditModal/      # Mobile cell editing overlay
│   │       ├── FileMenu/           # File action menu
│   │       ├── InvoiceSidebar/     # Editor sidebar
│   │       ├── Menu/               # Hamburger menu + dialogs
│   │       ├── socialcalc/         # Embedded SocialCalc engine
│   │       │   ├── core/           # Core modules (formula, format, etc.)
│   │       │   ├── modules/        # Extensions (touch, listeners, etc.)
│   │       │   └── utils/scriptLoader.ts
│   │       └── index.ts
│   │
│   ├── services/
│   │   ├── cloud-agent-service.ts  # Flask backend API client
│   │   ├── ipfs-service.ts         # Direct Pinata IPFS client
│   │   ├── local-template-service.ts  # Template + file management
│   │   ├── invoiceEditingService.ts   # Spreadsheet editing helpers
│   │   ├── exportAsPdf.ts         # PDF export (single sheet)
│   │   ├── exportAllAsPdf.ts      # PDF export (all sheets)
│   │   ├── exportAllSheetsAsPdf.ts # Multi-sheet PDF
│   │   └── exportAsCsv.ts         # CSV export
│   │
│   ├── contexts/
│   │   └── InvoiceContext.tsx      # Global state (file, template, currency)
│   │
│   ├── data/
│   │   ├── database.ts            # Database service (localStorage)
│   │   ├── schema.ts              # Schema constants
│   │   ├── migration.ts           # Data migration utilities
│   │   ├── types.ts               # TypeScript interfaces
│   │   └── repositories/          # CRUD repositories (localStorage)
│   │       ├── invoice-repository.ts
│   │       ├── customer-repository.ts
│   │       ├── inventory-repository.ts
│   │       └── business-info-repository.ts
│   │
│   ├── hooks/
│   │   └── useStatusBar.ts        # Native status bar hook
│   │
│   ├── types/
│   │   ├── socialcalc.d.ts        # SocialCalc TypeScript declarations
│   │   └── template.ts            # Template type interfaces
│   │
│   └── utils/
│       ├── settings.ts            # Settings persistence (IPFS creds, etc.)
│       ├── helper.ts              # General helpers
│       ├── InvoiceGenerator.ts    # ID generation
│       ├── invoiceAnalytics.ts    # Data analysis/parsing
│       ├── imageCompressor.ts     # Image compression
│       └── sheetChangeMonitor.ts  # Sheet tab change detection
│
├── android/                        # Android native project
├── ios/                            # iOS native project
└── scripts/                        # Build/automation scripts
```

---

## IPFS Integration

### Dual IPFS Strategy

The app uses two complementary IPFS approaches:

#### 1. Server-Side (Cloud Agent)
**File:** `route_handlers/AppAgentHandler.py` (Flask backend)

- Agent edits the blood sugar template via MCP tools
- Final report pinned to IPFS via Pinata using server's `PINATA_JWT`
- Metadata (CID, name, URL) stored in MongoDB (`user_ipfs_reports` collection)
- User can browse past reports and load them back

#### 2. Client-Side (Direct)
**File:** `src/services/ipfs-service.ts`

- User can manually pin any spreadsheet to IPFS
- User can import spreadsheets by CID from any IPFS gateway
- Credentials stored locally + synced to MongoDB when logged in
- Supports both JWT and API Key/Secret authentication with Pinata

### IPFS Credential Management

Credentials are stored in two places for offline resilience:
1. **localStorage** (`src/utils/settings.ts`) - Always available offline
2. **MongoDB** (`user_ipfs_credentials` collection) - Synced when online

Settings managed:
- `ipfsPinataJwt` - Pinata JWT token
- `ipfsPinataApiKey` - Pinata API key
- `ipfsPinataApiSecret` - Pinata API secret
- `ipfsGatewayUrl` - IPFS gateway URL (default: `https://gateway.pinata.cloud/ipfs/`)

### IPFS Report Structure

Reports pinned to IPFS follow this JSON structure:

```json
{
  "name": "Blood Sugar Report (2024-01-15)",
  "id": "report_1705312000",
  "total": 0,
  "templateId": "100001",
  "content": {
    "msc": {
      "numsheets": 6,
      "currentid": "sheet5",
      "currentname": "Blood Sugar Chart",
      "sheetArr": {
        "sheet5": { "name": "Blood Sugar Chart", "sheetstr": {...} },
        "sheet1": { "name": "sheet1 (Week 1)", "sheetstr": {...} },
        "sheet2": { "name": "sheet2 (Week 2)", "sheetstr": {...} },
        "sheet3": { "name": "sheet3 (Week 3)", "sheetstr": {...} },
        "sheet4": { "name": "sheet4 (Week 4)", "sheetstr": {...} },
        "sheet6": { "name": "sheet6 (Week 5)", "sheetstr": {...} }
      }
    }
  }
}
```

---

## MCP Agent Integration

### Blood Sugar Agent System Prompt

The Cloud Agent operates with a specialized system prompt that:
- Restricts editing to one workbook at a time
- Understands the 6-sheet template layout (Dashboard + 5 weekly logs)
- Knows the cell layout: Date (col C), Time (col D), Level (col E), rows 10-30
- Protects formulas in column C (rows 11-30) and average rows (31-33)
- Handles voice transcription errors gracefully
- Refuses to give medical advice

### Agent Tool Protocol

The agent communicates with the socialcalc-mcp server using JSON-RPC tool calls:

```json
{
  "call": "write_range",
  "arguments": {
    "workbookPath": "/path/to/temp_file.json",
    "sheetName": "sheet1",
    "range": "D10",
    "value": "08:00 AM"
  }
}
```

Available operations include all 35 MCP tools (read_range, write_range, format_cells, etc.).

### Voice Input

The CloudAgentPanel supports Web Speech API for voice dictation:
- Uses `SpeechRecognition` (or `webkitSpeechRecognition`)
- Continuous recognition with interim results
- Language: English (en-US)
- Transcription appended to text prompt before sending

---

## Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Ionic CLI (`npm install -g @ionic/cli`)
- Capacitor CLI (included in devDependencies)
- Xcode (for iOS builds)
- Android Studio (for Android builds)

### Installation

```bash
cd BloodSugarLog

# Install dependencies
npm install

# Start development server (port 3000)
npm run dev
```

### Environment Variables

Create a `.env` file or set in your environment:

```bash
# Backend API URL (Flask server)
VITE_API_URL=http://localhost:5001
```

### Development Commands

```bash
# Start dev server (hot-reload, port 3000)
npm run dev

# Type check + production build
npm run build

# Preview production build
npm run preview

# Run unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage
npm run test:coverage

# Run end-to-end tests (Cypress)
npm run test.e2e

# Lint
npm run lint
```

### Mobile Development

```bash
# Build web assets
npm run build

# Sync to native projects
npx cap sync

# Open in Xcode
npx cap open ios

# Open in Android Studio
npx cap open android

# Live reload on device
npx cap run ios --livereload --external
npx cap run android --livereload --external
```

### Backend Requirements

The Cloud Agent features require the Flask backend running:

```bash
# From the root Socialcalc-AI directory
source .venv/bin/activate
python3 main.py
# Server starts on port 5001
```

Required backend environment variables:
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` - For Claude via Bedrock
- `AWS_REGION` - AWS region (default: us-east-1)
- `PINATA_JWT` - Server-side IPFS pinning
- `MONGO_URI` / `MONGO_DB` - User credentials and report metadata

---

## App Navigation

| Route | Page | Description |
|-------|------|-------------|
| `/` | OnboardingPage | Welcome screen (shown once) |
| `/app/tabs/home/:fileName` | SocialCalcPage | Main spreadsheet editor |
| `/app/tabs/files` | FilesPage | Saved files list |
| `/app/tabs/settings` | SettingsPage | Auth + IPFS settings |

### Template System

Three built-in templates selected by device width:
- **Mobile** (ID: 100001) - Optimized for phone screens
- **Tablet** (ID: 100002) - Optimized for tablet screens
- **Desktop** (ID: 100003) - Full-size layout

Templates are stored in `public/templates/` with metadata in `meta/` and data in `data/`.

---

## Offline-First Design

- All spreadsheet data stored in localStorage
- No network required for basic editing
- IPFS features gracefully degrade when offline
- Cloud Agent requires network (communicates with Flask backend)
- Authentication state persisted locally (`user_email` in localStorage)
- IPFS credentials cached locally for offline access
- Maximum 15 saved files per device

---

## Key Features

### Blood Sugar Tracking
- 6-sheet workbook: Dashboard + 5 weekly logs
- Columns: Date, Time, Blood Sugar Level
- Auto-calculated averages and date formulas
- Dashboard with weekly average chart

### AI-Powered Editing
- Natural language commands: "Add reading 120 at 8am Monday"
- Voice input via Web Speech API
- Claude (Bedrock) interprets and executes via MCP tools
- Results automatically pinned to IPFS

### IPFS Cloud Backup
- Pin reports to decentralized storage
- Share via CID (content-addressable)
- Import reports from any IPFS gateway
- History tracked in both localStorage and MongoDB

### Export Options
- PDF (single sheet or all sheets)
- CSV
- Email (via Capacitor email composer)
- Print (via Capacitor printer plugin)

---

## License

MIT
