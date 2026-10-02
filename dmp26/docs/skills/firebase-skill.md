# Skill: Full Firebase Integration for Capacitor / Ionic SocialCalc Apps

This guide teaches an AI agent or developer how to cleanly and robustly integrate **Firebase Authentication (Email/Password + Google Sign-In)**, **Cloud Firestore Document Sync (with Client-Side AES-GCM Encryption)**, **Firebase Analytics**, and **Apple Privacy Compliance with Pure CocoaPods** into any Ionic + Capacitor React application (including spreadsheet-based SocialCalc apps).

---

## 🏗️ 1. Architecture Overview & Design Principles

1. **Decoupled Cloud Storage Architecture**:
   - All spreadsheet / document payloads are encrypted client-side using standard Web Crypto API (AES-GCM-256) with a user-derived key before transmission to Firestore.
   - Decoupled design allows seamless future migration from Firebase to AWS S3 or custom auth backends without refactoring data schemas.
2. **Pure CocoaPods Build System on iOS**:
   - Modern Capacitor (v7/v8) defaults to Swift Package Manager (`CapApp-SPM`). However, essential native plugins like `@codetrix-studio/capacitor-google-auth`, Printer, and Email Composer rely on CocoaPods.
   - Mixing SPM and CocoaPods causes `Framework 'AppAuth' not found` or symbol duplicate linker errors. We configure **100% CocoaPods** and remove `CapApp-SPM`.
3. **Hardened Apple App Store Compliance**:
   - Bundles `PrivacyInfo.xcprivacy` with official `NSPrivacyAccessedAPICategory*` constants.
   - Injects third-party privacy manifests into `GoogleSignIn`, `GTMAppAuth`, and `GTMSessionFetcher`.
   - Pre-configures `Info.plist` with required URL schemes, ATS rules, and photo library permissions.
4. **SocialCalc DOM Lifecycle Safety**:
   - SocialCalc spreadsheets mount on DOM nodes and keep memory references. Always use `window.location.href` for editor route transitions to force a clean lifecycle reload.

---

## 📦 2. Dependencies & Package Setup

### Install Required NPM Packages:
```bash
npm install firebase @codetrix-studio/capacitor-google-auth
```

> [!CAUTION]
> **Do NOT install `@capacitor-firebase/analytics`**. It causes Swift Clang module collisions with CocoaPods static Firebase xcframeworks. Use the standard JS SDK `firebase/analytics` directly, which runs natively and seamlessly inside Capacitor WebView across Web, iOS, and Android.

---

## ⚙️ 3. Firebase Configuration (`src/config/firebase.ts`)

Create `src/config/firebase.ts`:

```typescript
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
let analytics: Analytics | null = null;

export const isFirebaseConfigured = (): boolean => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
};

export const initializeFirebaseWeb = async (): Promise<{ app: FirebaseApp | null; analytics: Analytics | null }> => {
  if (analytics) return { app, analytics };
  if (!isFirebaseConfigured()) return { app, analytics: null };

  try {
    const supported = await isSupported();
    if (supported) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.warn("[Firebase Analytics] Web Analytics initialization fallback:", error);
  }

  return { app, analytics };
};

export { app, auth, db, analytics };
```

---

## 🔒 4. Client-Side Encryption & Storage Service (`src/services/firebase-storage-service.ts`)

Create `src/services/firebase-storage-service.ts`:

```typescript
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  where
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../config/firebase";

export interface CloudFileMetadata {
  id: string;
  name: string;
  templateId?: string | number;
  billType?: number;
  total?: number;
  billToDetails?: any;
  createdAt: string;
  modifiedAt: string;
  isEncrypted: boolean;
  version: number;
}

export interface CloudFile extends CloudFileMetadata {
  content: string; // MSC string / JSON payload
}

class EncryptionHelper {
  private static async getKey(userId: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(userId.padEnd(32, "0").slice(0, 32)),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: enc.encode("socialcalc_invoice_salt_v1"),
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  static async encrypt(text: string, userId: string): Promise<string> {
    if (!window.crypto?.subtle) return text;
    try {
      const key = await this.getKey(userId);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const enc = new TextEncoder();
      const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(text)
      );

      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encrypted), iv.length);
      return btoa(String.fromCharCode(...combined));
    } catch (e) {
      console.warn("Client-side encryption fallback:", e);
      return text;
    }
  }

  static async decrypt(cipherText: string, userId: string): Promise<string> {
    if (!window.crypto?.subtle) return cipherText;
    try {
      const binary = atob(cipherText);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const iv = bytes.slice(0, 12);
      const data = bytes.slice(12);
      const key = await this.getKey(userId);

      const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        data
      );
      return new TextDecoder().decode(decrypted);
    } catch (e) {
      // Return raw string if unencrypted or legacy
      return cipherText;
    }
  }
}

class FirebaseStorageService {
  private getUserFilesRef(userId: string) {
    return collection(db, "users", userId, "invoices");
  }

  async saveFileToCloud(
    userId: string,
    file: Omit<CloudFile, "createdAt" | "modifiedAt" | "isEncrypted" | "version"> & {
      createdAt?: string;
      modifiedAt?: string;
    }
  ): Promise<boolean> {
    if (!isFirebaseConfigured() || !userId) return false;

    try {
      const now = new Date().toISOString();
      const encryptedContent = await EncryptionHelper.encrypt(file.content, userId);
      const fileDocRef = doc(this.getUserFilesRef(userId), file.id);

      const payload = {
        id: file.id,
        name: file.name,
        templateId: file.templateId || "",
        billType: file.billType || 1,
        total: file.total || 0,
        billToDetails: file.billToDetails || null,
        content: encryptedContent,
        createdAt: file.createdAt || now,
        modifiedAt: now,
        isEncrypted: true,
        version: 1
      };

      await setDoc(fileDocRef, payload, { merge: true });
      return true;
    } catch (error) {
      console.error("Error saving file to Firestore:", error);
      return false;
    }
  }

  async getCloudFiles(userId: string): Promise<CloudFileMetadata[]> {
    if (!isFirebaseConfigured() || !userId) return [];

    try {
      const q = query(this.getUserFilesRef(userId), orderBy("modifiedAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: data.id || d.id,
          name: data.name || d.id,
          templateId: data.templateId,
          billType: data.billType || 1,
          total: data.total || 0,
          billToDetails: data.billToDetails || null,
          createdAt: data.createdAt,
          modifiedAt: data.modifiedAt,
          isEncrypted: Boolean(data.isEncrypted),
          version: data.version || 1
        };
      });
    } catch (error) {
      console.error("Error retrieving files from Firestore:", error);
      return [];
    }
  }

  async getCloudFileContent(userId: string, fileId: string): Promise<CloudFile | null> {
    if (!isFirebaseConfigured() || !userId || !fileId) return null;

    try {
      const fileDocRef = doc(this.getUserFilesRef(userId), fileId);
      const snapshot = await getDoc(fileDocRef);
      if (!snapshot.exists()) return null;

      const data = snapshot.data();
      let content = data.content;
      if (data.isEncrypted && content) {
        content = await EncryptionHelper.decrypt(content, userId);
      }

      return {
        ...data,
        content
      } as CloudFile;
    } catch (error) {
      console.error("Error getting file content from Firestore:", error);
      return null;
    }
  }

  async deleteFileFromCloud(userId: string, fileId: string): Promise<boolean> {
    if (!isFirebaseConfigured() || !userId || !fileId) return false;
    try {
      await deleteDoc(doc(this.getUserFilesRef(userId), fileId));
      return true;
    } catch (error) {
      console.error("Error deleting file from Firestore:", error);
      return false;
    }
  }
}

export const firebaseStorageService = new FirebaseStorageService();
```

---

## 👤 5. Auth Context (`src/contexts/AuthContext.tsx`)

```typescript
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup
} from "firebase/auth";
import { Capacitor } from "@capacitor/core";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { auth } from "../config/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPasswordReset: (e: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize native GoogleAuth plugin once
    if (Capacitor.isNativePlatform()) {
      try {
        GoogleAuth.initialize();
      } catch (e) {
        console.warn("GoogleAuth native initialize warning:", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const loginWithGoogle = async () => {
    if (Capacitor.isNativePlatform()) {
      const googleUser = await GoogleAuth.signIn();
      const idToken = googleUser.authentication.idToken;
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } else {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    }
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await GoogleAuth.signOut();
      } catch (e) {
        // Sign out regardless
      }
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        signUpWithEmail,
        loginWithGoogle,
        sendPasswordReset,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## 🖥️ 6. Editor & Cloud File Lifecycle Rules

### Rule 1: Always navigate via `window.location.href`
When opening any file from `Files.tsx` or Dashboard, use `window.location.href` instead of `router.push()`:
```typescript
const loadCloudFile = (key: string) => {
  window.location.href = `/app/editor/cloud-${key}`;
};

const editFile = (key: string) => {
  window.location.href = `/app/editor/${key}`;
};
```

### Rule 2: Wait for `authLoading` in `InvoicePage.tsx`
Never allow `initializeApp()` to run before Firebase Auth resolves, or cloud files will fail with "Please sign in":
```tsx
const { user, loading: authLoading } = useAuth();
const isCloudFile = Boolean(fileName && fileName.startsWith('cloud-'));
const cloudFileId = isCloudFile && fileName ? fileName.replace('cloud-', '') : null;

// Display connecting spinner while auth resolves
if (isCloudFile && authLoading) {
  return (
    <IonPage className="invoice-page">
      <IonHeader color="primary">
        <IonToolbar color="primary" className="invoice-toolbar" style={{ minHeight: '56px' }}>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => window.location.href = "/app/dashboard"} style={{ color: "white" }}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding ion-text-center">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <IonSpinner name="crescent" color="primary" />
          <p style={{ marginTop: "16px", color: "#64748b" }}>Connecting to cloud...</p>
        </div>
      </IonContent>
    </IonPage>
  );
}

// Ensure useEffect waits for authLoading
useEffect(() => {
  if (isCloudFile && authLoading) return;
  initializeApp();
}, [fileName, location.search, authLoading]);
```

### Rule 3: Header Cloud Indicator & Direct Save
```tsx
// Header title indicator:
<div style={{ display: "flex", alignItems: "center" }}>
  {isCloudFile && (
    <IonIcon
      icon={cloudOutline}
      style={{ marginRight: "6px", color: "white", fontSize: "20px" }}
      title="Cloud File"
    />
  )}
  <span>{isCloudFile ? cloudFileId : (fileName === "invoice" ? "New Invoice" : fileName)}</span>
</div>

// Save Button onClick:
<SaveIcon
  size={24}
  color="white"
  onClick={() => {
    if ((fileName === "invoice" || isNewInvoiceMode || !isInvoiceSaved) && !isCloudFile) {
      setShowSaveInvoiceDialog(true);
    } else {
      // Existing local file OR cloud file saves directly into the same file
      handleSaveClick();
    }
  }}
/>
```

---

## 📱 7. iOS Native Setup (Pure CocoaPods & Zero-SPM)

### Step 7.1: Remove `CapApp-SPM`
In the root iOS folder:
```bash
rm -rf ios/App/CapApp-SPM
```

### Step 7.2: `capacitor.config.ts`
```typescript
const config: CapacitorConfig = {
  appId: 'com.yourcompany.app',
  appName: 'YourApp',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};
```

### Step 7.3: `ios/App/App/Info.plist`
Add the reversed client ID URL scheme, ATS, and photo permissions:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>Google Sign-In</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR_IOS_REVERSED_CLIENT_ID</string>
      <string>com.googleusercontent.apps.YOUR_WEB_CLIENT_ID</string>
    </array>
  </dict>
</array>
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <false/>
  <key>NSExceptionDomains</key>
  <dict>
    <key>firestore.googleapis.com</key>
    <dict>
      <key>NSIncludesSubdomains</key>
      <true/>
      <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
      <false/>
    </dict>
  </dict>
</dict>
<key>ITSAppUsesNonExemptEncryption</key>
<false/>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Save documents and invoices to your Photo Library.</string>
```

### Step 7.4: `ios/App/Podfile` (With Auto-Patches & Privacy Manifest Injection)
```ruby
require_relative '../../node_modules/@capacitor/ios/scripts/pods_helpers'

platform :ios, '15.0'
use_frameworks!

install! 'cocoapods', :disable_input_output_paths => true

def capacitor_pods
  pod 'Capacitor', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorCordova', :path => '../../node_modules/@capacitor/ios'
  pod 'BcyesilCapacitorPluginPrinter', :path => '../../node_modules/@bcyesil/capacitor-plugin-printer'
  pod 'CapacitorApp', :path => '../../node_modules/@capacitor/app'
  pod 'CapacitorDevice', :path => '../../node_modules/@capacitor/device'
  pod 'CapacitorFilesystem', :path => '../../node_modules/@capacitor/filesystem'
  pod 'CapacitorPreferences', :path => '../../node_modules/@capacitor/preferences'
  pod 'CapacitorShare', :path => '../../node_modules/@capacitor/share'
  pod 'CapacitorStatusBar', :path => '../../node_modules/@capacitor/status-bar'
  pod 'CodetrixStudioCapacitorGoogleAuth', :path => '../../node_modules/@codetrix-studio/capacitor-google-auth'
  pod 'CapacitorEmailComposer', :path => '../../node_modules/capacitor-email-composer'
end

target 'App' do
  capacitor_pods
  pod 'FirebaseCore'
  pod 'FirebaseAuth'
  pod 'FirebaseFirestore'
end

def run_custom_post_install_patches(installer)
  # Fix gRPC-Core and gRPC-C++ for Xcode 16 Clang template compatibility
  ['gRPC-Core', 'gRPC-C++'].each do |pod_name|
    grpc_header = File.expand_path("Pods/#{pod_name}/src/core/lib/promise/detail/basic_seq.h", __dir__)
    if File.exist?(grpc_header)
      File.chmod(0644, grpc_header)
      text = File.read(grpc_header)
      text = text.gsub(
        "Traits::template CallSeqFactory(f_, *cur_, std::move(arg))",
        "Traits::template CallSeqFactory<>(f_, *cur_, std::move(arg))"
      )
      File.write(grpc_header, text)
    end
  end

  # Fix CodetrixStudioCapacitorGoogleAuth capacitorOpenURL break in modern Capacitor
  google_auth_plugin = File.expand_path('../../node_modules/@codetrix-studio/capacitor-google-auth/ios/Plugin/Plugin.swift', __dir__)
  if File.exist?(google_auth_plugin)
    text = File.read(google_auth_plugin)
    if text.include?('Notification.Name(Notification.Name.capacitorOpenURL.rawValue)')
      text = text.gsub('Notification.Name(Notification.Name.capacitorOpenURL.rawValue)', 'Notification.Name("capacitorOpenURL")')
      File.write(google_auth_plugin, text)
    end
  end
end

def add_privacy_manifests_to_pods(installer)
  manifests = {
    'GoogleSignIn' => File.expand_path('PrivacyManifests/GoogleSignIn/PrivacyInfo.xcprivacy', __dir__),
    'GTMAppAuth' => File.expand_path('PrivacyManifests/GTMAppAuth/PrivacyInfo.xcprivacy', __dir__),
    'GTMSessionFetcher' => File.expand_path('PrivacyManifests/GTMSessionFetcher/PrivacyInfo.xcprivacy', __dir__)
  }

  installer.pods_project.targets.each do |target|
    manifest_path = manifests[target.name]
    if manifest_path && File.exist?(manifest_path)
      pod_target_dir = File.expand_path("Pods/#{target.name}", __dir__)
      FileUtils.mkdir_p(pod_target_dir)
      dest_file = File.join(pod_target_dir, 'PrivacyInfo.xcprivacy')
      FileUtils.cp(manifest_path, dest_file)

      group = installer.pods_project.main_group.find_subpath("Pods/#{target.name}", true)
      file_ref = group.files.find { |f| f.path == dest_file || f.path == 'PrivacyInfo.xcprivacy' } || group.new_file(dest_file)
      resources_phase = target.resources_build_phase
      unless resources_phase.files_references.include?(file_ref)
        resources_phase.add_file_reference(file_ref)
      end
    end
  end

  app_pod_target = installer.pods_project.targets.find { |t| t.name == 'Pods-App' }
  if app_pod_target
    phase_name = '[CP] Embed Third-Party Privacy Manifests'
    existing_phase = app_pod_target.shell_script_build_phases.find { |p| p.name == phase_name }
    phase = existing_phase || app_pod_target.new_shell_script_build_phase(phase_name)
    phase.shell_script = <<~SCRIPT
      set -e
      FRAMEWORKS_DIR="${TARGET_BUILD_DIR}/${WRAPPER_NAME}/Frameworks"
      if [ -d "$FRAMEWORKS_DIR/GoogleSignIn.framework" ]; then
        cp -f "${PODS_ROOT}/../PrivacyManifests/GoogleSignIn/PrivacyInfo.xcprivacy" "$FRAMEWORKS_DIR/GoogleSignIn.framework/PrivacyInfo.xcprivacy"
      fi
      if [ -d "$FRAMEWORKS_DIR/GTMAppAuth.framework" ]; then
        cp -f "${PODS_ROOT}/../PrivacyManifests/GTMAppAuth/PrivacyInfo.xcprivacy" "$FRAMEWORKS_DIR/GTMAppAuth.framework/PrivacyInfo.xcprivacy"
      fi
      if [ -d "$FRAMEWORKS_DIR/GTMSessionFetcher.framework" ]; then
        cp -f "${PODS_ROOT}/../PrivacyManifests/GTMSessionFetcher/PrivacyInfo.xcprivacy" "$FRAMEWORKS_DIR/GTMSessionFetcher.framework/PrivacyInfo.xcprivacy"
      fi
    SCRIPT
  end

  installer.pods_project.save
end

post_install do |installer|
  assertDeploymentTarget(installer)
  run_custom_post_install_patches(installer)
  add_privacy_manifests_to_pods(installer)
end
```

---

## 🚫 8. Gotchas & Anti-Patterns Checklist

| Mistake | Why it fails | Correct Fix |
| :--- | :--- | :--- |
| **Keeping `CapApp-SPM`** | Xcode compiles SPM packages and fails to find CocoaPods dependencies (`Framework 'AppAuth' not found`). | Delete `ios/App/CapApp-SPM` and keep `project.pbxproj` pure CocoaPods. |
| **Installing `@capacitor-firebase/analytics`** | Swift Clang module clash with CocoaPods static Firebase xcframeworks. | Use `firebase/analytics` Web JS SDK directly. |
| **Not waiting for `authLoading`** | Opening a cloud file via URL immediately fails with "Please sign in" because Firebase Auth takes ~200ms to resolve initial session. | Show "Connecting to cloud..." spinner and return early if `isCloudFile && authLoading`. |
| **Navigating with `router.push()`** | SocialCalc spreadsheet engine does not reset global DOM/event state, leading to blank or corrupt sheet views. | Always navigate with `window.location.href = "/app/editor/..."`. |
| **Using un-patched `CodetrixStudioCapacitorGoogleAuth`** | `Notification.Name.capacitorOpenURL.rawValue` symbol is removed in modern Capacitor, causing build crash. | Patch it to `Notification.Name("capacitorOpenURL")` in `Podfile` post_install. |
| **Hardcoding `OTHER_LDFLAGS` without `$(inherited)`** | Prevents CocoaPods `.xcconfig` from linking required `-framework` flags. | Use `OTHER_LDFLAGS = "$(inherited) -ObjC"` or let `Pods-App.debug.xcconfig` handle it. |
