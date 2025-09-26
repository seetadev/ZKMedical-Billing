# Environment Configuration

This project uses environment variables to securely manage Firebase configuration and other sensitive settings.

## Quick Setup

1. **Copy the environment template:**

   ```bash
   cp .env.sample .env
   ```

2. **Configure your Firebase credentials:**

   - Open the `.env` file
   - Replace the placeholder values with your actual Firebase project credentials
   - Save the file

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Environment Variables

All environment variables for this Vite project must be prefixed with `VITE_` to be accessible in the frontend code.

### Firebase Configuration

| Variable                            | Description                  | Example                                   |
| ----------------------------------- | ---------------------------- | ----------------------------------------- |
| `VITE_FIREBASE_API_KEY`             | Firebase Web API Key         | `<your-project-api-key>` |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase Auth Domain         | `your-project.firebaseapp.com`            |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase Project ID          | `your-project-id`                         |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase Storage Bucket      | `your-project.firebasestorage.app`        |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | `123456789`                            |
| `VITE_FIREBASE_APP_ID`              | Firebase App ID              | `<your-firebase-app-id>`         |

## Security Notes

- ✅ **DO**: Keep your `.env` file local and never commit it to version control
- ✅ **DO**: Use the `.env.sample` file as a template for team members
- ✅ **DO**: Ensure all team members have their own `.env` file
- ❌ **DON'T**: Share your `.env` file or post Firebase credentials publicly
- ❌ **DON'T**: Commit `.env` files to Git (it's already in `.gitignore`)

## Troubleshooting

### Environment Variables Not Loading

1. Ensure your `.env` file is in the project root directory
2. Restart your development server after creating/modifying `.env`
3. Check that all variables start with `VITE_` prefix

### Firebase Connection Issues

1. Verify all Firebase environment variables are set correctly
2. Check that your Firebase project is active in the Firebase Console
3. Ensure Authentication and Firestore are enabled in your Firebase project

### Production Deployment

When deploying to production, ensure all environment variables are configured in your deployment platform:

- Vercel: Add environment variables in the dashboard
- Netlify: Configure in site settings
- Other platforms: Follow their environment variable configuration guide

## Development vs Production

- **Development**: Uses `.env` file for local development
- **Production**: Uses platform-specific environment variable configuration
- **Security**: Firebase API keys are safe to expose in frontend code as they're designed for client-side use with proper Firestore security rules
