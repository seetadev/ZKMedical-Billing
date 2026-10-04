# Firebase Authentication & Cloud Save / Retrieve Integration

## Overview
This document details the integration of **Firebase Authentication (Email/Password)** and **Cloud Save & Retrieve (Encrypted Firestore Storage)** into the Invoice Suite app, aligned with the reference architecture from `Nutrition-Tracker-New-MVP-Firebase-and-IAP`.

---

## Architectural Components

### 1. Configuration (`src/config/firebase.ts`)
- Initializes Firebase Modular SDK v12.
- Exports `app`, `auth`, `db` (Firestore), and `analytics`.
- Uses `.env` variables (`VITE_FIREBASE_*`).

### 2. Client-Side Encryption (`src/utils/crypto.ts`)
- Uses the native **Web Crypto API (AES-GCM)**.
- Derives a 256-bit key from the user's unique Firebase UID and a secret salt.
- Invoices are encrypted before uploading to Firestore and decrypted in memory upon retrieval.

### 3. Cloud Storage Service (`src/services/firebase-storage-service.ts`)
- **Firestore Path**: `users/{userId}/apps/invoice-app/files/{fileId}`
- **Operations**:
  - `saveFileToCloud(userId, file)`: Saves metadata and encrypted content with merge support.
  - `getCloudFiles(userId)`: Returns list of metadata ordered by `modifiedAt desc`.
  - `getCloudFileContent(userId, fileId)`: Fetches file document and decrypts content.
  - `deleteFileFromCloud(userId, fileId)`: Deletes file document from Firestore.
  - `cloudFileExists(userId, fileId)`: Checks if file exists.

### 4. Authentication (`src/contexts/AuthContext.tsx` & `src/components/Auth/AuthModal.tsx`)
- Provides `useAuth()` hook throughout the application.
- Supports:
  - **Email & Password Sign In** (`loginWithEmail`)
  - **Email & Password Sign Up** (`signUpWithEmail`)
  - **Google Sign-In** (`loginWithGoogle` via `@codetrix-studio/capacitor-google-auth` on native & Firebase Popup on web)
  - **Password Reset** (`sendPasswordReset`)
  - **Sign Out** (`logout`)

### 5. Apple Privacy & Native iOS Configuration
- **Privacy Manifest (`PrivacyInfo.xcprivacy`)**:
  - Registered in Xcode `project.pbxproj` Copy Bundle Resources.
  - Declares `NSPrivacyAccessedAPICategoryFileTimestamp` (`C617.1`), `NSPrivacyAccessedAPICategoryUserDefaults` (`CA92.1`), and `NSPrivacyAccessedAPICategorySystemBootTime` (`35F9.1`).
- **Third-Party Privacy Manifests**:
  - Embedded into `GoogleSignIn.framework`, `GTMAppAuth.framework`, and `GTMSessionFetcher.framework` via CocoaPods `post_install` hook.
- **Info.plist Compliance**:
  - `CFBundleURLTypes`: Added Reversed Client ID and Web Client ID schemes for Google Auth.
  - `NSPhotoLibraryAddUsageDescription`: Set to avoid ITMS-90683 rejection.
  - `NSAppTransportSecurity`: Enforced `NSAllowsArbitraryLoads = false`.
  - `ITSAppUsesNonExemptEncryption`: Set to `false` for automatic export compliance.
- **Capacitor Configuration (`capacitor.config.ts`)**:
  - `GoogleAuth` plugin configured with `serverClientId` and `scopes`.

### 6. Cloud File Lifecycle & Editor Integration
- **Navigation via `window.location.href`**:
  - In `src/components/Files/Files.tsx`, clicking on a cloud file navigates via `window.location.href = "/app/editor/cloud-" + key` (and `/app/editor/${key}` for local files). This guarantees a clean DOM/lifecycle reset for the SocialCalc spreadsheet engine.
- **Connecting to Cloud Loader**:
  - In `src/pages/InvoicePage.tsx`, when `isCloudFile` is true and `authLoading` is active, displays a dedicated "Connecting to cloud..." spinner to prevent premature initialization before auth state resolves.
- **Header Cloud Indicator**:
  - The top toolbar displays `cloudOutline` icon next to the filename (`cloudFileId`), clearly indicating to the user that they are editing a cloud-synced document.
- **Direct Cloud Save**:
  - Clicking the Save icon in the toolbar on a cloud file directly persists modifications back into that same cloud document (`firebaseStorageService.saveFileToCloud`) without opening the "Save As" naming prompt.

### 7. UI Integration
- **Files Component (`src/components/Files/Files.tsx`)**:
  - Segment switcher: **Local Files** vs **Cloud Files**.
  - Displays unauthenticated promotional card prompting user to sign in.
  - Lists cloud invoices with status, customer details, amount, date, and delete action.
  - Clicking on a cloud file routes to `/app/editor/cloud-{id}`.
- **Invoice Editor (`src/pages/InvoicePage.tsx` & `src/components/InvoicePage/FileMenu/FileOptions.tsx`)**:
  - Detects `isCloudFile` when URL matches `cloud-{id}`.
  - Fetches and decrypts invoice data directly from Firestore on load.
  - Save button saves directly back to Cloud when editing cloud files.
  - "Save to Cloud" option added in File menu.
- **Settings Page (`src/pages/SettingsPage.tsx`)**:
  - Shows logged-in user email and "Sign Out" button.
  - Shows "Sync to Cloud" action card when logged out.
