# 🔐 GitHub Secrets Setup Guide

This guide helps you set up the required GitHub Secrets for the automated APK release workflow.

## 📋 Required Secrets

You need to add these 4 secrets to your GitHub repository:

| Secret Name               | Description                                  |
| ------------------------- | -------------------------------------------- |
| `RELEASE_KEYSTORE_BASE64` | Your Android keystore file encoded in base64 |
| `RELEASE_STORE_PASSWORD`  | Password for the keystore file               |
| `RELEASE_KEY_ALIAS`       | Alias name of the key in the keystore        |
| `RELEASE_KEY_PASSWORD`    | Password for the specific key alias          |

## 🚀 Quick Setup Steps

### Step 1: Access Repository Secrets

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Step 2: Convert Keystore to Base64

If you already have a keystore file (`my-release-key.jks` or similar):

```bash
# On Linux/MacOS
base64 -i android/app/my-release-key.jks | tr -d '\n' > keystore-base64.txt

# On Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("android\app\my-release-key.jks")) > keystore-base64.txt
```

### Step 3: Add Each Secret

Add these secrets one by one:

#### 1. RELEASE_KEYSTORE_BASE64

- **Name**: `RELEASE_KEYSTORE_BASE64`
- **Value**: Content of the `keystore-base64.txt` file (long string)

#### 2. RELEASE_STORE_PASSWORD

- **Name**: `RELEASE_STORE_PASSWORD`
- **Value**: Your keystore password (e.g., `your-secure-password`)

#### 3. RELEASE_KEY_ALIAS

- **Name**: `RELEASE_KEY_ALIAS`
- **Value**: Your key alias (e.g., `my-key-alias`)

#### 4. RELEASE_KEY_PASSWORD

- **Name**: `RELEASE_KEY_PASSWORD`
- **Value**: Your key password (often same as store password)

## 🔑 Don't Have a Keystore? Create One!

If you don't have a release keystore yet:

```bash
# Navigate to your Android app directory
cd android/app

# Generate a new keystore (replace values with your details)
keytool -genkeypair -v -storetype PKCS12 \
  -keystore my-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias my-key-alias \
  -dname "CN=Your Name, OU=YourApp, O=YourCompany, L=YourCity, S=YourState, C=YourCountry"

# You'll be prompted for passwords - remember them!
```

**Important**:

- Use strong passwords
- Store the keystore file safely (backup it!)
- Never lose this keystore - you can't update your app without it

## ✅ Verification

After adding all secrets, you should see 4 secrets in your repository settings:

- ✅ RELEASE_KEYSTORE_BASE64
- ✅ RELEASE_STORE_PASSWORD
- ✅ RELEASE_KEY_ALIAS
- ✅ RELEASE_KEY_PASSWORD

## 🔧 Testing the Setup

Create a test PR with `[release]` in the title and merge it to test if the workflow works correctly.

## 🚨 Security Notes

- **Never commit** keystore files to your repository
- **Keep passwords secure** and don't share them
- **Backup your keystore** - losing it means you can't update your published app
- **Use different passwords** for store and key if possible

## 🆘 Need Help?

If you encounter issues:

1. Check that all 4 secrets are correctly named
2. Verify your keystore works locally first
3. Look at the GitHub Actions logs for specific error messages
4. Create an issue with the error details

---

💡 **Pro Tip**: You can test your keystore locally before adding it to GitHub:

```bash
cd android
./gradlew assembleRelease
```

If this works, your keystore setup is correct! 🎉
