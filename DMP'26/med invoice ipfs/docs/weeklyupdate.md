# Weekly Status Update - IPFS Messkit Integration & App Automation

## 1. Overview
This week, we achieved successful integration of **IPFS Messkit** with the offline-first SocialCalc spreadsheet suite and deployed automated pipelines to streamline multi-platform branding, screenshot generation, and asset compilation. This ensures the suite can be dynamically rebuilt as custom apps (such as **Patient Sheet**, **Medical Invoice**, or **Medical Suite**) while supporting complete decentralized storage on IPFS.

---

## 2. IPFS Messkit Integrations
We integrated IPFS and Pinata pinning capabilities into three specific app configurations to enable medical professionals to save and share clinical sheets in a decentralized manner:

| Repository / App | Description | Mapped Layout / Templates |
| --- | --- | --- |
| [Patient Sheet](https://github.com/aspiringsdgs/patient-sheet) | Offline patient records, check-ups, and medication tracking. | 7-Sheet mobile/tablet clinical forms (`tab.json` and `mob.json`) |
| [Medical Invoice](https://github.com/aspiringsdgs/medical-invoice) | Practice billing and treatment cost sheets. | 4-Sheet invoicing and receipt templates |
| [Medical Suite](https://github.com/aspiringsdgs/medical-suite) | All-in-one clinical administration hub. | Complete patient logs + billing calculations |

### Key Features Implemented:
- **Decentralized Pinning**: Integrated Pinata SDK in `src/services/ipfs-service.ts` to pin exported PDFs and spreadsheets to the IPFS network.
- **Dynamic Metadata Association**: Automatically tag pinned files with metadata key-values (e.g., `app: "patientsheet"`, `app: "medicalsuite"`) to filter and retrieve documents by app context.
- **PDF & CSV Export Integrations**: Integrated `html2canvas` and `jsPDF` to export medical spreadsheets to PDF before uploading them to IPFS.

---

## 3. Playwright Screenshot Automation
To streamline app store submissions and user documentation, we created a Playwright-based screenshot generation pipeline.

- **Repository Directory**: [app-screenshot-automation](https://github.com/its-me-ani/IPFS-apps-automation/tree/main/scripts/app-screenshot-automation)
- **Key Capabilities**:
  - **Multi-viewport Emulation**: Spawns headless browser instances representing iOS devices, Android phones, tablets, and desktop resolutions.
  - **State Traversal**: Automates logging in, stepping through the onboarding wizard, clicking the "Get Started" call-to-actions, and loading specific SocialCalc spreadsheet workbooks.
  - **Dynamic Capture**: Captures high-definition, pixel-perfect PNG assets of the active components to represent real-world clinical usage.

---

## 4. App Assets Generation Pipeline
We created a pipeline that automates the tedious task of asset generation from a single source image file.

- **Repository Directory**: [app-assets-generation](https://github.com/its-me-ani/IPFS-apps-automation/tree/main/scripts/app-assets-generation)
- **Key Capabilities**:
  - **Universal Resizing**: Uses macOS native `sips` (or helper scripts) to downscale a high-resolution source icon into all target dimensions.
  - **iOS AppIcon & Launch Screen Generator**: Compiles `AppIcon.appiconset` and `Splash.imageset` matching Xcode 15+ asset specifications.
  - **PWA Asset Suite**: Outputs touch-icons, web-manifest icons (`192x192`, `512x512`), and favicon assets.
  - **Android Mipmap Builder**: Automates the distribution of generated pngs into res/mipmap folders.

---

## 5. Rebranding & Customization Automation
We built an automated patching engine that allows rebranding the codebase into any of the target clinical apps with a single command.

- **Repository Directory**: [app-update-automation](https://github.com/its-me-ani/IPFS-apps-automation/tree/main/scripts/app-update-automation)
- **Central Config File**: `scripts/app-update-automation/data.json`
- **Automation Runner**: `scripts/app-update-automation/update-app.sh`
- **Target Files Patched (19 targets / 31 matches)**:
  - **Metadata & Identifiers**: `package.json`, `package-lock.json`, PWA manifests, capacitor configurations.
  - **iOS Native Configs**: `Info.plist`, `project.pbxproj` (bundle identifiers, app display name, and camera/microphone permissions).
  - **UI Theme Tokens**: Injecting primary `#0d9488` HSL/hex palettes into `src/theme/variables.css`.
  - **UX Copywriting**: Rebranding greeting headers, settings info labels, and onboarding screens.

---

## 6. Current Workspace Implementation Summary
This week, we executed the customization automation to rebrand the current workspace to **Patient Sheet (v5.0.0)**:
1. **Applied Configurations**: Updated `data.json` to Patient Sheet styling and copywriting.
2. **Fixed Parser Edge Case**: Resolved a python-regex issue in `update-app.sh` where inline arrow functions inside TSX elements (e.g. `<IonButton onClick={() => ...}>`) broke the string-replacement regex parser.
3. **Build Integrity Check**: Ran `npm run build` with **100% success** (0 typescript errors, clean production bundle).
4. **Capacitor Sync**: Executed `npx cap sync` to copy assets and configurations to native platform folders (`ios/App/App/public`).
