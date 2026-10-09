# 🎫 GitHub Issue: Weekly Infrastructure, Subscription & PDF Export Overhaul

## 📌 Context
Over the past week, critical core architectural updates and debugging operations were conducted across the project workspace to resolve blocking pipeline bugs, formulate native mobile IAP testing guides, document encryption-migration options, and bootstrap the setups of the **Nutrition Tracker** and **Workout Planner** applications.

This issue tracks the comprehensive set of changes and documentation written to map the exact technical details of the systems implemented.

---

## 🛠️ Scope of Work & Fixed Issues

### 1. 🐛 Offline PDF Export Slicing & Canvas Rendering Fixes
*   **Problem:** PDF exports were cutting content mid-row when splitting tables across pages. Additionally, `<canvas>` charts generated on-screen by JFlot were rendered blank because `html2canvas` copies cloned references instead of canvas raster pixels.
*   **Resolution:**
    *   Designed pixel-scale coordinate calculations to inspect row bounding boxes (`<tr>`) at render time. Splitting thresholds now programmatically snap to row boundaries instead of slicing through text.
    *   Created the `syncCanvases()` rendering helper to read raw viewport canvas pixels and redraw them onto the offscreen target container prior to export.
    *   Removed hardcoded limits (like the 3-sheet export constraint) and resolved empty first-page issues in multi-sheet generation.

### 2. 💳 iOS Subscriptions & In-App Purchases (IAP) Guide
*   **Requirement:** An offline-first billing model under Capacitor using `cordova-plugin-purchase` requires detailed local receipt validation verification and structured Sandbox/TestFlight test profiles.
*   **Deliverables:** Formulated a deployment guide detailing:
    *   Metadata restrictions inside App Store Connect.
    *   Local validation loops bypass config (`store.validator`).
    *   Xcode schema configurations for switching between local `.storekit` mock environments and App Store sandbox environments.
    *   Real-time debugging procedures via the Safari web inspector on a physical iOS device.

### 3. 🔐 Data Security & Encryption Architecture
*   **Context:** Ensure security compliance when managing on-device (local) and remote (cloud) database assets.
*   **System Details:**
    *   Cloud: AES-256-GCM using Web Crypto API. Key is derived via the user's Firebase Auth UID + static salt.
    *   Local: AES-256-CBC using CryptoJS. Key is a user-supplied password.
*   **Migration Pathway:** Created step-by-step guidance on how to migrate encrypted assets from Firebase Firestore to Amazon S3 or Relational SQL databases, and instructions on how to handle UID changes without losing data.

### 4. 🔥 Cloud Sync & App Configurations
*   **Task:** Establish basic Firebase integration frameworks (Firestore, Auth, Rules) and initial application configurations.
*   **Updates:**
    *   Auth rules for Google OAuth, Email/Password, and Firestore user isolation rules documented.
    *   Theme cleanup and metadata config adjustments (Bundle ID: `com.aspiring.WorkoutTracker`, Version: `7.0`, Build: `1`) completed for the Workout Planner app.

---

## 📂 Deliverables (Files Added)
The following reference documentation files have been created in the repository:
*   [DMP'26/offline-pdf-fix.md](file:///Users/anirudhsharma/Desktop/C4GT/0. Base App Codebase/ZKMedical-Billing/DMP'26/offline-pdf-fix.md)
*   [DMP'26/ios_iap_testing_guide.md](file:///Users/anirudhsharma/Desktop/C4GT/0. Base App Codebase/ZKMedical-Billing/DMP'26/ios_iap_testing_guide.md)
*   [DMP'26/encryption-architecture.md](file:///Users/anirudhsharma/Desktop/C4GT/0. Base App Codebase/ZKMedical-Billing/DMP'26/encryption-architecture.md)
*   [DMP'26/firebase-setup.md](file:///Users/anirudhsharma/Desktop/C4GT/0. Base App Codebase/ZKMedical-Billing/DMP'26/firebase-setup.md)
*   [DMP'26/weekupdates.md](file:///Users/anirudhsharma/Desktop/C4GT/0. Base App Codebase/ZKMedical-Billing/DMP'26/weekupdates.md)
