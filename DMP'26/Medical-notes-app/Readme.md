<div align="center">
 
# 📝 Medical Notes App
 
### 📱 Premium Offline Medical Notes & Medication Log Tracker
 
[![iOS Badge](https://img.shields.io/badge/iOS-000000?style=for-the-badge&logo=apple&logoColor=white)](https://developer.apple.com)
[![Android Badge](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com)
[![Capacitor Badge](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com)
[![React Badge](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![TypeScript Badge](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Ionic Badge](https://img.shields.io/badge/Ionic-3880FF?style=for-the-badge&logo=ionic&logoColor=white)](https://ionicframework.com)

**Fully Offline Mobile & Tablet Medical Notes App** 🚀
 
*A modern, offline-first medication log and health tracker built with Ionic React and Capacitor. Record daily health indicators, dosage schedules, symptoms, and clinical notes — all without an internet connection. Supports IPFS-based decentralized backups for tamper-proof records.*
 
[💻 Dev Setup](#-installation--development) • [🧱 Project Structure](#-project-structure) • [📖 Architecture](#-architecture)
 
</div>

---

## 📸 Screenshots

The user interface is optimized for rapid clinical logging, touch interactions, and offline-first storage:

<div align="center">

### 📱 Core Application Flow & Sheets

<table>
  <tr>
    <td align="center" valign="top" width="33%"><img src="public/screenshot/Simulator%20Screenshot%20-%20iPhone%2017%20Pro%20-%202026-06-02%20at%2021.01.47.png" width="220"/><br/><b>Welcome Onboarding</b></td>
    <td align="center" valign="top" width="33%"><img src="public/screenshot/Simulator%20Screenshot%20-%20iPhone%2017%20Pro%20-%202026-06-02%20at%2021.09.49.png" width="220"/><br/><b>Main Dashboard</b></td>
    <td align="center" valign="top" width="33%"><img src="public/screenshot/Simulator%20Screenshot%20-%20iPhone%2017%20Pro%20-%202026-06-03%20at%2000.24.39.png" width="220"/><br/><b>Spreadsheet Editor</b></td>
  </tr>
  <tr>
    <td align="center" valign="top" width="50%"><img src="public/screenshot/Simulator%20Screenshot%20-%20iPhone%2017%20Pro%20-%202026-06-03%20at%2000.24.43.png" width="220"/><br/><b>Saved Files Registry</b></td>
    <td align="center" valign="top" width="50%"><img src="public/screenshot/Simulator%20Screenshot%20-%20iPhone%2017%20Pro%20-%202026-06-03%20at%2000.24.48.png" width="220"/><br/><b>Application Settings</b></td>
  </tr>
</table>

</div>

---

## ✨ Core Features

<table>
<tr>
<td width="50%">

### 📴 100% Offline Capability
All medical notes, dosage schedules, patient preferences, and logos are stored securely on the device's local storage. The app requires zero internet connectivity to function.

### 🔒 Patient Data Privacy
No cloud connections, telemetry, or remote databases. Sensitive medical notes and daily logs remain strictly on the user's device.

### 📋 Record Management
Create and manage multiple medical notebooks. Search, duplicate, edit, and delete notes from a centralized file registry.

</td>
<td width="50%">

### 💼 SocialCalc Spreadsheet Engine
Built on a touch-optimized wrapper over the robust **SocialCalc spreadsheet engine**. Supports grid editing, column resizing, custom cell styling, alignment, and formula calculations for automatic statistics and medical logs.

### 🧾 Multi-Sheet Templates
Pre-designed medical note layouts optimized for various viewports:
- **Mobile**: Medication log sheets optimized for mobile layouts.
- **Tablet**: Comprehensive medication log and health tracker sheets.
- **Footer Tabs**: Categorized logs (e.g., Yearly, Monthly sheets).

</td>
</tr>
<tr>
<td width="50%">

### ✏️ Rapid Form Entry
Fill out clinical notes and log entries through a clean, intuitive form interface that maps directly onto the spreadsheet grid.

</td>
<td width="50%">

### 📄 Export as PDF & CSV
Generate professional, print-ready medical reports as high-resolution PDFs or export raw data as CSV for health logs.

</td>
</tr>
<tr>
<td width="50%">

### ☁️ Decentralized IPFS Backups
Pin and backup medical notes to the IPFS network (via Pinata Gateway) to create immutable, tamper-proof logs that are verifiable and retrievable.

</td>
<td width="50%">

### 🤖 Automation Suite
Built-in scripts for automated native asset generation (icons, splash screens), simulator screenshots, and branding configuration patchers.

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Core UI Framework** | **React 19** & **Ionic 8** | Mobile-first components, smooth transitions, and native tab navigation |
| **Language** | **TypeScript** | Strict type safety across note data models, templates, and service layers |
| **Native Integration** | **Capacitor 8** | Runtime bridge for native iOS and Android compilation |
| **Spreadsheet Engine** | **SocialCalc (Legacy)** | Formula evaluation, grid rendering, multi-sheet note state management |
| **Storage** | **localStorage** | Offline JSON serialization for notes, templates, and preferences |
| **Build & Bundle** | **Vite 7** | Fast HMR development server and optimized production bundling |
| **PDF Generation** | **jsPDF + html2canvas** | Client-side high-fidelity PDF export of medical notes |
| **Decentralized Storage** | **IPFS (Pinata)** | Tamper-proof backup and verification via content-addressed hashing |

</div>

---

## 📲 Installation & Development

### Prerequisites

- ✅ Node.js v18 or higher
- ✅ npm or yarn
- ✅ Xcode 15+ (for iOS simulator/device builds)
- ✅ macOS (required for native iOS compilation)

### Development Steps

```bash
# 1. Install project dependencies
npm install

# 2. Run local web development server
npm run dev

# 3. Compile static production bundles
npm run build

# 4. Sync web assets with Capacitor native bridge
npx cap sync ios

# 5. Open iOS Xcode Project workspace
npx cap open ios
```

Inside Xcode, select target simulator/device and run. For Android development, configure the Android SDK and use `npx cap sync android`.

---

## 🧱 Project Structure

```
📦 medical-notes/
├── 📂 ios/                  # Xcode Native iOS project files
├── 📂 src/
│   ├── 📂 components/       # Reusable UI components
│   │   ├── 📂 Files/        # File listing and actions
│   │   ├── 📂 Storage/      # Client localStorage adapter
│   │   └── 📂 socialcalc/   # SocialCalc grid renderer and config
│   ├── 📂 contexts/         # React state managers (Invoice Context)
│   ├── 📂 data/             # Data layer definitions
│   │   ├── 📂 repositories/ # localStorage CRUD
│   │   └── schema.ts        # Model schemas & identifiers
│   ├── 📂 pages/            # Screen components (Dashboard, Files, Settings, Onboarding)
│   ├── 📂 services/         # PDF export, CSV export, template service, IPFS service
│   ├── 📂 utils/            # Analytics, settings helpers, math utilities
│   └── 📂 types/            # TypeScript interfaces
├── 📂 public/
│   ├── 📂 templates/        # JSON layouts (mobile & tablet)
│   └── 📂 assets/           # App logos, icons & splash screen assets
├── 📂 scripts/
│   └── 📂 app-update-automation/  # Branding config & automated patchers
├── 📄 capacitor.config.ts   # Capacitor configuration
├── 📄 ionic.config.json     # Ionic build parameters
└── 📄 package.json          # Package manifest & build scripts
```

---

## 📖 Architecture

The application runs on a fully offline, client-side architecture:

```
┌────────────────────────────────────────────────────────┐
│                   📝 IONIC UI LAYER                    │
│   Dashboard Home │ Notes Editor │ Files Registry       │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                  🔄 REACT STATE BRIDGE                 │
│         Invoice Context + Device Preferences           │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    💾 STORAGE LAYER                    │
│      localStorage (Invoices, Templates, Settings)      │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                  ☁️ IPFS BACKUP LAYER                  │
│       Pinata Gateway (Immutable Invoice Pinning)       │
└────────────────────────────────────────────────────────┘
```

- **State Sync**: Context loads persisted notes from `localStorage` on initial mount.
- **Save Flow**: Form changes validate, map back to SocialCalc's MSC format, and write to `localStorage` key `invoicecalc_saved_invoices`.
- **IPFS Backup**: Notes can be pinned to the IPFS network via Pinata for decentralized, tamper-proof archival.
- **Performance**: Formula calculations execute directly on the legacy SocialCalc engine within the client webview.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
