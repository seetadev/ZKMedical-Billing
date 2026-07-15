# 📱 Business Calculator

A premium, offline-first financial and marketing calculation application built with the **Ionic Framework (React)** and **Capacitor**. The core computation engine uses a mobile-optimized adaptation of **SocialCalc** to deliver spreadsheet-grade calculation logic on touch screens.

Compute present value, monthly loan payments, gross margins, inventory turnover, markups, and markdowns instantly and securely.

---

## 🎨 Application Screenshots

### 🚀 Onboarding & Dashboard
| Welcome & Onboarding | Active Calculations Dashboard | Saved Files List |
| :---: | :---: | :---: |
| <img src="scripts/app-screenshot-automation/screenshots/iphone65/1_welcome.png" width="220" alt="Welcome Screen" /> | <img src="scripts/app-screenshot-automation/screenshots/iphone65/2_template_tab_1_FINANCIAL_1.png" width="220" alt="Dashboard Calculations" /> | <img src="scripts/app-screenshot-automation/screenshots/iphone65/4_files_page.png" width="220" alt="Files List" /> |

### 📈 Calculators & Tools
| Financial Calculations (Tab 2) | Marketing Calculations (Tab 1) | Marketing Calculations (Tab 2) |
| :---: | :---: | :---: |
| <img src="scripts/app-screenshot-automation/screenshots/iphone65/2_template_tab_2_FINANCIAL_2.png" width="220" alt="Financial Tab 2" /> | <img src="scripts/app-screenshot-automation/screenshots/iphone65/2_template_tab_3_MARKETING_1.png" width="220" alt="Marketing Tab 1" /> | <img src="scripts/app-screenshot-automation/screenshots/iphone65/2_template_tab_4_MARKETING_2.png" width="220" alt="Marketing Tab 2" /> |

### ⚡ Features & Settings
| Touch-optimized Input Overlay | Decentrialized IPFS Cloud Save | Default Preferences |
| :---: | :---: | :---: |
| <img src="scripts/app-screenshot-automation/screenshots/iphone65/3_edit_modal.png" width="220" alt="Mobile Cell Editing" /> | <img src="scripts/app-screenshot-automation/screenshots/iphone65/2_ipfs_save_dialog.png" width="220" alt="IPFS Decentrialized Backup" /> | <img src="scripts/app-screenshot-automation/screenshots/iphone65/5_settings_page.png" width="220" alt="Settings Page" /> |

---

## ✨ Key Features

- **100% Offline-First Storage**: Powered by `@capacitor-community/sqlite` for local, fast structured storage. All files, custom spreadsheets, and metadata reside entirely on the local device.
- **Legacy SocialCalc Engine**: Legacy spreadsheet calculation engine wrapped and enhanced with modern custom cell-input overlays designed for mobile and tablet keyboards.
- **Decentralized Cloud Backups**: Built-in IPFS integration allowing users to export, share, and backup their sheets securely using cryptographic Content Identifiers (CIDs).
- **Financial Module**:
  - Present Value & Future Value of an Amount/Annuity
  - Rate of Return (Lump Sum)
  - Monthly Loan Payments (PMT)
  - After-Tax Real Rate of Return
  - Taxable/Tax-Free Equivalent Yields
- **Marketing Module**:
  - Sales Revenue (Gross/Net sales, returns, discounts)
  - Gross Margin & Gross Margin Percentage
  - Cost of Goods Sold (COGS)
  - Inventory Turnover Analytics
  - Markups (based on selling price or cost) and Markdown percentages
- **Local Settings**: Choose preferred global default currency (INR, USD, EUR, GBP, JPY, AUD, CAD) and manage data cleanup directly.

---

## 🛠️ Tech Stack & Architecture

- **Core Framework**: [Ionic React](https://ionicframework.com/docs/react) v8.7
- **UI & Logic**: React 19, TypeScript, Framer Motion
- **Native Bridge**: Capacitor v8
- **Database Layer**: SQLite (`@capacitor-community/sqlite`) as primary, `localStorage` for settings/state sync.
- **Bundler**: Vite
- **Decentralized Storage**: IPFS Gateway APIs

```
┌─────────────────────────────────────────────────────────┐
│                        UI LAYER                         │
│   (DashboardHome, SocialCalcPage, Settings, Files)      │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  CONTEXT & STATE LAYER                  │
│       InvoiceContext (React) ──▶ LocalStorage           │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                      │
│   localTemplateService ──▶ repositories/ (SQLite DAOs)  │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                    │
│   DatabaseService ──▶ SQLite / Migration / Templates     │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Development & Setup

### Prerequisites
- Node.js (v18+)
- Ionic CLI (`npm install -g @ionic/cli`)

### Quick Start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server locally:
   ```bash
   npm run dev
   ```
3. Run Unit Tests:
   ```bash
   npm run test.unit
   ```
4. Build Web Distribution:
   ```bash
   npm run build
   ```

### Capacitor Integration (Native Platforms)
To run on Android or iOS devices:
```bash
# Sync files to native folders
npx cap sync

# Run on iOS simulator/device
npx cap run ios

# Run on Android emulator/device
npx cap run android
```

---

## 🤖 App Automation & Rebranding Suite

This repository acts as a **base template** for generating customized, offline-first SocialCalc spreadsheet applications. Inside the [scripts](file:///Users/anirudhsharma/Desktop/C4GT/0.%20Base%20App%20Codebase/APPs/ipfs-apps/patient%20sheet%20copy/scripts) directory, you will find three distinct automation pipelines to rebrand, asset-generate, and screenshot-automate your target app variants.

### 1. App Configuration & Rebranding (`scripts/app-update-automation`)
Easily update the core identity, descriptions, icons, template configurations, theme colors, and PDF layouts across **19 files** in a single run.

*   **Configuration File**: [data.json](file:///Users/anirudhsharma/Desktop/C4GT/0.%20Base%20App%20Codebase/APPs/ipfs-apps/patient%20sheet%20copy/scripts/app-update-automation/data.json)
    Define app properties, onboarding screen features, brand primary/secondary colors, PWA parameters, and default template settings in this file.
*   **Automation Script**: [update-app.sh](file:///Users/anirudhsharma/Desktop/C4GT/0.%20Base%20App%20Codebase/APPs/ipfs-apps/patient%20sheet%20copy/scripts/app-update-automation/update-app.sh)
*   **How to execute**:
    Run the following command from the repository root:
    ```bash
    bash scripts/app-update-automation/update-app.sh
    ```

### 2. Branding Asset Generation (`scripts/app-assets-generation`)
This pipeline automatically scans the workspace to find high-resolution PNG templates for your app's icon and splash screen, sampling background colors to properly pad and export multi-platform assets.

*   **Generated Assets**:
    *   **iOS Assets**: iOS App Store high-res icon (`AppIcon-512@2x.png`) and universal Launch Screen splash images.
    *   **PWA/Web Assets**: Touch icons, favicons, and standard sizes (64x64, 192x192, 512x512) written directly to `public/`.
*   **Automation Script**: [generate_assets.sh](file:///Users/anirudhsharma/Desktop/C4GT/0.%20Base%20App%20Codebase/APPs/ipfs-apps/patient%20sheet%20copy/scripts/app-assets-generation/generate_assets.sh) (wrapping [generate_assets.py](file:///Users/anirudhsharma/Desktop/C4GT/0.%20Base%20App%20Codebase/APPs/ipfs-apps/patient%20sheet%20copy/scripts/app-assets-generation/generate_assets.py))
*   **How to execute**:
    Run the following command from the repository root:
    ```bash
    bash scripts/app-assets-generation/generate_assets.sh
    ```

### 3. App Store Screenshot Automation (`scripts/app-screenshot-automation`)
Automates high-resolution screenshot generation simulating all major iPhone and iPad viewports using Playwright. The script navigates the full application flow—onboarding, document editing, and options screens—and captures them for App Store Connect.

*   **Viewports Covered**:
    *   **6.9" Display**: iPhone 16 Pro Max (1320x2868 px)
    *   **6.5" Display**: iPhone 14 Plus / 13 Pro Max (1284x2778 px)
    *   **6.1" Display**: iPhone 16 / 15 / 14 / 13 / 12 (1170x2532 px)
    *   **13" iPad**: iPad Pro 13" (2064x2752 px)
    *   **11" iPad**: iPad Pro 11" (1668x2388 px)
*   **Configuration**: Customize viewports, targets, and edit cells/values inside [screenshot-config.json](file:///Users/anirudhsharma/Desktop/C4GT/0.%20Base%20App%20Codebase/APPs/ipfs-apps/patient%20sheet%20copy/scripts/app-screenshot-automation/screenshot-config.json).
*   **How to execute**:
    1. Make sure your local application server is running (e.g., `npm run dev` at `http://localhost:3000`).
    2. Navigate to the automation directory and install dependencies:
       ```bash
       cd scripts/app-screenshot-automation
       npm install
       npx playwright install
       ```
    3. Run the screen capturer:
       ```bash
       npm run capture
       ```
    *Screenshots will be output directly to the local `/screenshots` subdirectory grouped by device size.*

