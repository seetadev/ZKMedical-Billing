# Firebase Setup Instructions

To enable Firebase authentication and cloud storage functionality in your SocialCalc application, follow these steps:

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "SocialCalc-Cloud")
4. Follow the setup wizard to create your project

## 2. Enable Authentication

1. In your Firebase project console, navigate to "Authentication" in the left sidebar
2. Click on the "Get started" button
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication by clicking on it and toggling the "Enable" switch
5. Save the changes

## 3. Set up Cloud Firestore

1. In your Firebase project console, navigate to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for now (you can configure security rules later)
4. Select a location for your database
5. Click "Done"

## 4. Get Firebase Configuration

1. In your Firebase project console, click on the gear icon (⚙️) and select "Project settings"
2. Scroll down to the "Your apps" section
3. Click on the web app icon (`</>`) to add a web app
4. Enter an app nickname (e.g., "SocialCalc Web App")
5. Click "Register app"
6. Copy the Firebase configuration object

## 5. Update Firebase Configuration

1. Copy the `.env.sample` file to `.env`:

   ```bash
   cp .env.sample .env
   ```

2. Open the `.env` file and replace the placeholder values with your actual Firebase config:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-actual-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
VITE_FIREBASE_APP_ID=your-actual-app-id
```

**Note**: The `.env` file is already configured in `.gitignore` to prevent committing sensitive credentials to version control.

## 6. Configure Firestore Security Rules (Optional but Recommended)

For production use, update your Firestore security rules to ensure users can only access their own files:

1. Go to "Firestore Database" > "Rules" in the Firebase console
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own files
    match /files/{fileId} {
      allow read, write, delete: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Click "Publish" to save the rules

## 7. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to the Settings page
3. Click on "Sign In" under the Cloud Storage section
4. Create a new account or sign in with existing credentials
5. Try uploading a file to the cloud from the Files page

## Features Available

Once configured, users will be able to:

- **Sign up/Sign in**: Create accounts and authenticate using email and password
- **Cloud file storage**: Save files to Firebase Firestore
- **File synchronization**: Move files between local storage and cloud storage
- **Cross-device access**: Access files from any device when signed in
- **Secure storage**: Files are associated with user accounts and protected by authentication

## Troubleshooting

### Common Issues:

1. **"Missing required Firebase environment variables" error**: Make sure you've created a `.env` file from the `.env.sample` template and filled in all the Firebase configuration values

2. **"Firebase config not found" error**: Ensure your `.env` file is in the root directory of the project and all environment variables start with `VITE_`

3. **Authentication not working**: Ensure Email/Password authentication is enabled in the Firebase console

4. **Permission denied errors**: Check that your Firestore security rules allow authenticated users to read/write their own files

5. **Network errors**: Verify your Firebase project is active and the configuration keys in your `.env` file are correct

6. **Environment variables not loading**: Restart your development server after creating or modifying the `.env` file

### Support

If you encounter issues, check:

- Firebase Console for any error messages
- Browser developer console for JavaScript errors
- Ensure your internet connection is stable
- Verify all Firebase services (Authentication and Firestore) are enabled

## Security Best Practices

1. **Never commit Firebase config to public repositories** if it contains sensitive information
2. **Use environment variables** for sensitive configuration in production
3. **Implement proper Firestore security rules** to protect user data
4. **Enable App Check** in production for additional security
5. **Monitor usage** in the Firebase console to detect unusual activity
