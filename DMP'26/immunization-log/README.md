# 🚀 SocialCalc App Automation Engine

Welcome to the **SocialCalc Automation App Suite**! This repository serves as a centralized base app and automation toolkit designed to generate, customize, and rebrand hybrid offline spreadsheets, PWAs, and native iOS applications built on top of the **SocialCalc** engine.

With a single-source configuration, you can dynamically spin up specialized financial/utility apps (e.g., *Cash Receipt*, *Account Balance*, *Rent Receipt*, *Invoice Maker*) without manual, tedious code modification.

---

## 📂 Repository Structure

The workspace is organized into two main parts:

```
📂 0. Base App Codebase
├── 📂 AspiringApp-no-logo/     # The rebrandable base application (React + Ionic 8 + Capacitor 8)
│   ├── 📂 scripts/
│   │   └── 📂 app-update-automation/  # Rebranding configuration & automated scripts
│   ├── 📂 src/                 # App source code (Components, Pages, Services, SocialCalc core)
│   ├── 📄 package.json         # Dependency tree
│   └── ...
└── 📄 README.md                # This workspace directory documentation
```

- **[AspiringApp-no-logo/](AspiringApp-no-logo)**: The source template app. It contains a fully functional spreadsheet-driven utility interface.
- **[app-update-automation/](AspiringApp-no-logo/scripts/app-update-automation)**: The automation scripts that ingest configurations to re-brand the base app into specialized apps.

---

## ⚡ The Automation Workflow

Rebranding the base app into a new application is fully automated. Instead of searching and replacing strings across dozens of files, the automation handles everything in a single command.

### 1. Configure
Edit the central configuration file:
👉 **[data.json](AspiringApp-no-logo/scripts/app-update-automation/data.json)**

In `data.json`, you define:
- **Application Details**: App Name, Package Identifier (Bundle ID), Versions, and Descriptions.
- **Styling & Theme**: CSS custom color tokens (Primary & Secondary HSL/RGB colors) to customize the visual look.
- **Onboarding Screens**: Welcome text, custom feature lists, and Call-to-Action text.
- **Page Titles & Tab Names**: Dynamic header titles and tab bar labels.
- **Spreadsheet Templates**: Spreadsheet sheets, custom grid structures, and footer tabs.
- **PWA Manifest Details**: Short/Full names, background colors.
- **Native iOS Permissions**: Privacy camera/photos usage descriptions.
- **App Icons**: Local path to a 1024x1024 PNG icon to auto-generate all required sizes for iOS and PWA web targets.

### 2. Run the Automation
Navigate to the base app directory and run the script:
```bash
cd AspiringApp-no-logo
bash scripts/app-update-automation/update-app.sh
```

### 3. Review & Build
Check your local changes and build the application:
```bash
# View modified files
git diff

# Run development server to test locally
npm run dev

# Build production assets and sync to native iOS targets
npm run build
npx cap sync ios
npx cap open ios
```

---

## 🛠️ Files Patched Dynamically

The script updates **19+ files/directories** across the application:
- `package.json`, `ionic.config.json`, `capacitor.config.ts`, `index.html`, PWA `manifest.json`.
- CSS variable tokens inside `src/theme/variables.css` (primary/secondary styling).
- iOS app metadata (`Info.plist`) & Xcode project versioning/bundle identifiers (`project.pbxproj`).
- Component titles and UI strings (`OnboardingPage.tsx`, `SettingsPage.tsx`, `FilesPage.tsx`, `DashboardLayout.tsx`, `App.tsx`, `Menu.tsx`).
- PDF and CSV export configs (`exportAsPdf.ts`, `exportAllSheetsAsPdf.ts`).
- Icon packs and spreadsheet models.

---

> [!NOTE]
> For more details on the inner workings of the update engine, refer to the automation README:
> 👉 **[app-update-automation/README.md](AspiringApp-no-logo/scripts/app-update-automation/README.md)**
# Automation-base-app
# Automation-base-app
