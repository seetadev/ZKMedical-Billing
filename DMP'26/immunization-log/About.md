<div align="center">
 
# 📦 AspiringApp (Base Spreadsheet App Template)
 
### 📱 Premium Offline Spreadsheet Utility & Rebrandable Base App Codebase
 
[![iOS](https://img.shields.io/badge/iOS-000000?style=for-the-badge&logo=apple&logoColor=white)](https://developer.apple.com)
[![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Ionic](https://img.shields.io/badge/Ionic-3880FF?style=for-the-badge&logo=ionic&logoColor=white)](https://ionicframework.com)
 
**Base Version** • iOS & Web Template 🚀
 
*A highly customizable, offline-first hybrid mobile spreadsheet template built with Ionic React and Capacitor. This codebase serves as the base for building specialized financial/utility apps (e.g., Account Balance, Cash Receipt, Invoice Maker). Rebrand and customize the entire app in seconds using the built-in update automation scripts.*
 
[📖 Automation Guide](#-rebranding--automation) • [💻 Dev Setup](#-installation--development) • [🧱 Project Structure](#%EF%B8%8F-project-structure)
 
</div>

---

## 📸 Screenshots (Default Template)

The template UI provides a professional layout optimized for offline financial entry and calculations:

<div align="center">
<table>
  <tr>
    <td align="center"><img src="public/app-listing/mobile-ss/Welcome-screen.png" width="200"/><br/><b>Onboarding</b></td>
    <td align="center"><img src="public/app-listing/mobile-ss/Business-info.png" width="200"/><br/><b>Dashboard Stats</b></td>
    <td align="center"><img src="public/app-listing/mobile-ss/files.png" width="200"/><br/><b>Saved Registers</b></td>
  </tr>
  <tr>
    <td align="center"><img src="public/app-listing/mobile-ss/invoice1.png" width="200"/><br/><b>Register Sheet</b></td>
    <td align="center"><img src="public/app-listing/mobile-ss/edit.png" width="200"/><br/><b>Register Entry Form</b></td>
    <td align="center"><img src="public/app-listing/mobile-ss/export.png" width="200"/><br/><b>Export & Print</b></td>
  </tr>
</table>
</div>

---

## ⚡ Rebranding & Automation

Instead of manually editing package configs, bundle IDs, assets, and colors across the code, this application uses a centralized config file and automation script.

### Configuration Configuration Path
👉 **[scripts/app-update-automation/data.json](scripts/app-update-automation/data.json)**

### How to Run the Update Script
Run the bash script from the project root (this folder):
```bash
bash scripts/app-update-automation/update-app.sh
```

### Automation Details
The script patches **19 files** in one run:
1. **Config & Package Files**: `capacitor.config.ts`, `package.json`, `ionic.config.json`, `index.html`, `public/manifest.json`.
2. **Branding Assets**: Generates favicons and web/iOS-sized icons from a single source image (`icon.sourceIconPath`).
3. **App Styling**: Replaces theme color variables in `src/theme/variables.css`.
4. **App Contents**: Updates template spreadsheet JSON structures, page titles, onboarding slides, tab names, and native iOS camera/photo permission dialog text (`Info.plist`).

For full details, read the automation docs:
👉 **[scripts/app-update-automation/README.md](scripts/app-update-automation/README.md)**

---

## ✨ Core Features

<table>
<tr>
<td width="50%">

### 📴 100% Offline Capable
All spreadsheet files, logs, and signatures are stored locally. No internet connectivity is required to load, write, or query files.

### 🔒 Ultimate Privacy
Zero cloud connections, trackers, or remote databases. All calculations and inputs remain completely private on the user's device.

### 💼 SocialCalc Engine
Uses a custom, touch-optimized wrapper around the robust **SocialCalc spreadsheet canvas**. Supports formula evaluations, column resizing, custom styling, cell alignment, and font configurations.

### 💰 Transaction Entry Form
Add transactions instantly using a simple, native **Register Entry Form** that appends calculations and values to spreadsheet cells automatically.

</td>
<td width="50%">

### 📊 Dashboard Analytics
Maintains summary analytics of created sheets, running balances, default transaction currencies, and onboarding preferences.

### 📄 Export & PDF Engine
Generates professional high-resolution PDF documents from sheets. Supports over-the-air iOS AirPrint, sharing as PDF, and exporting database sheets into standard CSV format.

### 📲 Premium UI Design
Beautiful native bottom-tab layout, interactive state transitions, custom touch scroll overlays, local storage persistence, and sleek modal controllers.

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

| Category | Technology | Description |
|:--------:|:----------:|:------------|
| **UI Framework** | ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black) ![Ionic](https://img.shields.io/badge/Ionic_8-3880FF?style=flat-square&logo=ionic&logoColor=white) | For rendering the hybrid application wrapper and modular UI screens. |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | For strict type safety across the database repositories and spreadsheet interfaces. |
| **Native Bridge** | ![Capacitor](https://img.shields.io/badge/Capacitor_8-119EFF?style=flat-square&logo=capacitor&logoColor=white) | For building native web builds into iOS Xcode project directories. |
| **Spreadsheet Core** | ![SocialCalc](https://img.shields.io/badge/SocialCalc-Legacy_Engine-003B57?style=flat-square) | Core evaluation, cell, and formula grid spreadsheet parser engine. |
| **Build & Tooling** | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | Build packager and dev server executor. |

</div>

---

## 📲 Installation & Development

### Prerequisites

- ✅ Node.js v18 or higher
- ✅ npm or yarn
- ✅ Xcode 15 or higher (required for iOS native compilation)
- ✅ macOS (required for compiling native targets)

### Setup Steps

```bash
# 1. Install project dependencies
npm install
 
# 2. Run local development environment
npm run dev
 
# 3. Compile static production bundles
npm run build
 
# 4. Synchronize static code into Capacitor native wrapper
npx cap sync ios
 
# 5. Open Xcode to compile/test/run on simulators or devices
npx cap open ios
```

Inside Xcode, build and package the app targets: **Product → Archive → Distribute App**

---

## 🏗️ Project Structure

```
📦 AspiringApp-no-logo/
├── 📂 ios/                  # Xcode Native iOS project structure
├── 📂 src/
│   ├── 📂 components/       # Layout, file list modals, data forms
│   │   └── 📂 socialcalc/   # Custom SocialCalc engine integration & wrappers
│   ├── 📂 contexts/         # React Context state stores (Register contexts)
│   ├── 📂 data/             # Local database repositories (SQLite/LocalStore)
│   ├── 📂 hooks/            # Native viewport status bars and system hooks
│   ├── 📂 pages/            # View pages (Home, Files, Settings)
│   ├── 📂 services/         # PDF generator & CSV exporter engines
│   └── 📂 utils/            # Shared math/canvas and string helpers
├── 📂 public/
│   ├── 📂 templates/        # Default JSON sheet layouts (Mobile/Tablet templates)
│   └── 📂 assets/           # App static resources & launch screens
├── 📂 scripts/
│   └── 📂 app-update-automation/  # Rebranding configuration & automate scripts
├── 📄 capacitor.config.ts   # Capacitor runtime bridge configurations
├── 📄 ionic.config.json     # Ionic build parameters
└── 📄 package.json          # Package manifest & build execution scripts
```

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local development server |
| `npm run build` | Compile static production bundles |
| `npm run test` | Run unit/integration tests with Vitest |
| `ionic serve` | Serves application via Ionic CLI devserver |
| `npx cap sync ios` | Syncs compiled production bundle into native iOS target |
| `npx cap open ios` | Opens the iOS target configuration folder in Xcode |

---

## 🏛️ Architecture

The application runs on a fully client-side **Offline-First Hybrid Architecture**:

```
┌────────────────────────────────────────────────────────┐
│                   📱 IONIC UI LAYER                    │
│   Dashboard Home │ Register Sheets │ Files Listing     │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                  🔄 REACT STATE BRIDGE                 │
│         Context Managers + Device Preferences          │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    💾 STORAGE LAYER                    │
│   LocalStorage (Registers, Signatures, Assets)         │
└────────────────────────────────────────────────────────┘
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### Made with ❤️ for cross-platform app distribution

![iOS Badge](https://img.shields.io/badge/Built_for-iOS-000000?style=for-the-badge&logo=apple&logoColor=white)

**⭐ Star this repo if you find it useful!**

</div>
