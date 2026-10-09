# Manual Firebase Setup Guide

To complete the Firebase integration and enable Cloud saving & User authentication (Email/Password, Google, Apple Sign-in), you need to configure your Firebase Console. Follow these step-by-step instructions.

---

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or select an existing one).
3. Name your project (e.g., `Nutrition Tracker App`) and follow the configuration wizard.
4. (Optional) Enable Google Analytics for the project if desired.
5. Once created, click on the **Web icon (`</>`)** on the Project Overview page to register a new Web App:
   * Enter an app nickname (e.g., `Nutrition Tracker Web`).
   * Click **Register app**.
   * Note down the generated `firebaseConfig` object containing variables like `apiKey`, `authDomain`, etc.

---

## Step 2: Set Up Environment Variables

In the root of your project, create a file named `.env` and fill it with your Firebase configuration values. Vite will automatically load these:

```bash
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Step 3: Enable Authentication Providers

1. In the Firebase Console left menu, navigate to **Build** > **Authentication**.
2. Click **Get Started** to initialize Auth.
3. Select the **Sign-in method** tab and configure:

### A. Email/Password
1. Click **Email/Password**.
2. Switch **Enable** to active. (Keep *Email link (passwordless sign-in)* disabled).
3. Click **Save**.

### B. Google Sign-In
1. Click **Add new provider** and select **Google**.
2. Switch **Enable** to active.
3. Configure a public-facing name and support email.
4. Click **Save**.
5. *Note for Capacitor native apps (iOS/Android):* You will also need to add your iOS Bundle ID or Android SHA-1 fingerprint in the Project Settings if running on a physical simulator/device.

---

## Step 4: Provision Cloud Firestore

1. In the Firebase Console left menu, navigate to **Build** > **Firestore Database**.
2. Click **Create database**.
3. Choose your database location (select a location closest to your users, e.g., `us-central` or `asia-east`).
4. Select **Start in test mode** (or production mode) and click **Create**.
5. Once provisioned, navigate to the **Rules** tab at the top and deploy the following security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Restrict files so that users can only read/write documents inside their own account folder
    match /users/{userId}/files/{fileId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

6. Click **Publish** to deploy the rules.

---

## Step 5: Verification & Run

1. Open your terminal in the project directory.
2. Run `npm run dev` to start the local Vite development server.
3. Log in/Register via the new **Cloud Account** card in the **Settings tab**.
4. Test creating trackers, saving them to the cloud via the editor popover, and retrieving them on the **Cloud Trackers** list!

---

## Step 6: Native Mobile Apps (iOS & Android) Configuration

When building this application as a native iOS (iPhone/iPad) or Android app via Capacitor, standard browser popups (e.g., `signInWithPopup`) for Google and Apple Sign-In are **not** supported inside the native web view container. 

To enable OAuth logins on native mobile devices, you must implement native authentication plugins and pass the acquired credentials to Firebase.

### A. Email & Password Authentication
*   **Status**: Works out of the box. No native configuration is required.

### B. Google Sign-In on Native iOS & Android
To configure native Google Sign-In:
1.  Install the Capacitor Google Auth plugin:
    ```bash
    npm install @codetrix-studio/capacitor-google-auth
    ```
2.  Configure your Web Client ID and iOS/Android Client IDs in `capacitor.config.ts`:
    ```typescript
    import { CapacitorConfig } from '@capacitor/cli';
    const config: CapacitorConfig = {
      // ...
      plugins: {
        GoogleAuth: {
          scopes: ['profile', 'email'],
          serverClientId: 'YOUR_WEB_CLIENT_ID_FROM_FIREBASE_CONSOLE.apps.googleusercontent.com',
          forceCodeForRefreshToken: true,
        },
      },
    };
    export default config;
    ```
3.  **For iOS**: Add the reversed client ID custom URL scheme to your `Info.plist` inside Xcode.
4.  **For Android**: Add your SHA-1 key fingerprint inside the Firebase Console settings and download the updated `google-services.json`.
5.  In your React code, trigger the native login dialog and sign in using the Firebase credential link:
    ```typescript
    import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
    import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

    const loginWithNativeGoogle = async () => {
      const googleUser = await GoogleAuth.signIn();
      const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
      await signInWithCredential(auth, credential);
    };
    ```


