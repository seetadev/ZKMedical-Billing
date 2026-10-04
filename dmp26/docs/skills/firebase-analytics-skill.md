# Skill: Lightweight Firebase Analytics Integration for Capacitor / Ionic Apps

This skill document provides a foolproof, zero-native-conflict guide to integrating **Firebase Analytics** into any Ionic + Capacitor application (Web, iOS, Android).

---

## 🎯 Why This Approach?

Instead of using heavy native wrapper plugins like `@capacitor-firebase/analytics` (which often cause Swift Clang module conflicts, CocoaPods linker errors, and version mismatch issues with Google libraries), this integration uses the official **Firebase Web JS SDK (`firebase/analytics`)**.

### Benefits:
- **Zero iOS/Android native build friction**: No pods, no Gradle dependencies, no Swift Clang errors.
- **100% Platform Coverage**: Runs smoothly in Capacitor's WebView on iOS, Android, and desktop browsers.
- **Automatic Lifecycle Tracking**: Tracks `app_open`, `app_close`, session duration, and device platform.
- **Persistent Anonymous User Tracking**: Automatically generates and stores a persistent UUID in `localStorage`.

---

## 📦 Step 1: Install Firebase SDK

Run inside the project root:
```bash
npm install firebase
```

---

## ⚙️ Step 2: Configure Firebase (`src/config/firebase.ts`)

Create or update `src/config/firebase.ts`:

```typescript
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
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
let analytics: Analytics | null = null;

export const isFirebaseConfigured = (): boolean => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
};

export const initializeFirebaseWeb = async (): Promise<{ app: FirebaseApp | null; analytics: Analytics | null }> => {
  if (analytics) {
    return { app, analytics };
  }

  if (!isFirebaseConfigured()) {
    console.info("[Firebase Analytics] Config not provided. Running in offline fallback mode.");
    return { app, analytics: null };
  }

  try {
    const supported = await isSupported();
    if (supported) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.warn("[Firebase Analytics] Web Analytics initialization notice:", error);
  }

  return { app, analytics };
};

export { app, analytics };
```

---

## 📊 Step 3: Create the Analytics Service (`src/services/analyticsService.ts`)

Create `src/services/analyticsService.ts`:

```typescript
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { logEvent as logWebEvent, setUserId as setWebUserId } from "firebase/analytics";
import { initializeFirebaseWeb } from "../config/firebase";

const USER_ID_KEY = "app_unique_analytics_user_id";

class AnalyticsService {
  private isInitialized = false;
  private isNative = Capacitor.isNativePlatform();
  private sessionStartTime: number = Date.now();

  /**
   * Get or generate a persistent anonymous unique user ID
   */
  private getOrCreateUniqueUserId(): string {
    try {
      let userId = localStorage.getItem(USER_ID_KEY);
      if (!userId) {
        // Generate RFC4122 v4 UUID
        userId = "usr_" + "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
        localStorage.setItem(USER_ID_KEY, userId);
      }
      return userId;
    } catch {
      return "usr_anonymous";
    }
  }

  /**
   * Initialize Firebase Analytics and setup lifecycle listeners
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const uniqueUserId = this.getOrCreateUniqueUserId();
      const { analytics } = await initializeFirebaseWeb();
      if (analytics) {
        setWebUserId(analytics, uniqueUserId);
      }

      this.isInitialized = true;
      this.sessionStartTime = Date.now();

      // 1. Log initial App Open
      await this.logAppOpen();

      // 2. Setup Lifecycle listeners for foreground/background
      this.setupLifecycleListeners();
    } catch (error) {
      console.warn("[Analytics] Initialization notice:", error);
    }
  }

  /**
   * Log App Open event
   */
  public async logAppOpen(): Promise<void> {
    this.sessionStartTime = Date.now();
    await this.logEvent("app_open", {
      platform: Capacitor.getPlatform(),
    });
  }

  /**
   * Log App Close / Background event with active session duration
   */
  public async logAppClose(): Promise<void> {
    const sessionDurationSeconds = Math.max(0, Math.round((Date.now() - this.sessionStartTime) / 1000));
    await this.logEvent("app_close", {
      session_duration_seconds: sessionDurationSeconds,
      platform: Capacitor.getPlatform(),
    });
  }

  /**
   * Custom Event Logger
   */
  public async logEvent(name: string, params?: Record<string, any>): Promise<void> {
    if (import.meta.env.DEV) {
      console.debug(`[Analytics] 📊 Event: ${name}`, params);
    }

    try {
      const { analytics } = await initializeFirebaseWeb();
      if (analytics) {
        logWebEvent(analytics, name, params);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`[Analytics] Could not log ${name}:`, error);
      }
    }
  }

  /**
   * Listen to App foreground (open) and background (close) on native & web
   */
  private setupLifecycleListeners(): void {
    if (this.isNative) {
      // Native Capacitor App state changes
      CapacitorApp.addListener("appStateChange", ({ isActive }) => {
        if (isActive) {
          this.logAppOpen();
        } else {
          this.logAppClose();
        }
      });
    } else {
      // Web Visibility / Unload
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          this.logAppOpen();
        } else if (document.visibilityState === "hidden") {
          this.logAppClose();
        }
      });

      window.addEventListener("beforeunload", () => {
        this.logAppClose();
      });
    }
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
```

---

## 🚀 Step 4: Initialize in Root Component (`src/App.tsx`)

In `src/App.tsx`:

```tsx
import React, { useEffect } from "react";
import { analyticsService } from "./services/analyticsService";

const AppContent: React.FC = () => {
  useEffect(() => {
    analyticsService.initialize();
  }, []);

  return (
    // Your app JSX routes
  );
};
```

---

## 💡 How to Track Custom Events

Anywhere in your pages or components:

```typescript
import { analyticsService } from "../services/analyticsService";

// Example 1: Button click
analyticsService.logEvent("invoice_created", {
  template_id: "template_1",
  currency: "INR",
  item_count: 5
});

// Example 2: Export action
analyticsService.logEvent("export_pdf", {
  format: "a4",
  page_count: 2
});
```

---

## 🚫 Critical Avoidances

1. **Do NOT use `@capacitor-firebase/analytics` pod**: Causes Swift Clang module issues with `FirebaseCore` static xcframeworks.
2. **Never block user flow on analytics**: `logEvent` calls must catch errors silently so telemetry never interferes with app functionality.
3. **Keep `isSupported()` check**: Always check `isSupported()` before calling `getAnalytics()` to gracefully handle environments where IndexedDB / cookies are restricted.
