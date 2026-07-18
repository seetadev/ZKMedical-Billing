# App Update Automation

A single-command script that rebrands the entire app from one `data.json` configuration file.

## Quick Start

```bash
# 1. Edit data.json with your new app values
# 2. Run from the project root (Invoice directory):
bash scripts/app-update-automation/update-app.sh
```

## What It Updates

The script patches **19 files** across the codebase in one run:

| # | File | What Changes |
|---|------|-------------|
| 1 | `capacitor.config.ts` | `appId`, `appName`, `backgroundColor` |
| 2 | `package.json` | `name`, `version`, `description` |
| 3 | `ionic.config.json` | `name` |
| 4 | `index.html` | `<title>`, `apple-mobile-web-app-title` |
| 5 | `public/manifest.json` | `short_name`, `name`, `theme_color`, `background_color` |
| 6 | `src/app-data.ts` | `APP_NAME` export |
| 7 | `src/theme/variables.css` | All primary + secondary CSS color tokens (12 properties) |
| 8 | `src/pages/OnboardingPage.tsx` | Welcome title, subtitle, 3 features, CTA button text |
| 9 | `src/pages/SettingsPage.tsx` | App name, marketing version, build number, descriptions |
| 10 | `src/pages/FilesPage.tsx` | Page header title |
| 11 | `src/components/DashboardLayout.tsx` | Header `<h1>` text |
| 12 | `src/App.tsx` | Tab bar labels (Home, Files, Settings) |
| 13 | `src/services/local-template-service.ts` | Template names, descriptions, hashtags, type, footer tab names |
| 14 | `src/components/InvoicePage/Menu/Menu.tsx` | `APP_NAME`, print title, email subject, share texts, fallback filenames |
| 15 | `src/services/exportAsPdf.ts` | PDF footer label, default filename |
| 16 | `src/services/exportAllSheetsAsPdf.ts` | PDF footer, default filenames, sheet name |
| 17 | `src/components/InvoiceForm.tsx` | Save toast message |
| 18 | `ios/App/App/Info.plist` | `CFBundleDisplayName`, privacy usage descriptions |
| 19 | `ios/App/App.xcodeproj/project.pbxproj` | `MARKETING_VERSION`, `CURRENT_PROJECT_VERSION` |

### Optional Updates (when paths are provided in data.json)

| Feature | data.json field | What Happens |
|---------|----------------|-------------|
| **App Icon** | `icon.sourceIconPath` | Resizes to iOS 1024×1024 (no alpha) + generates PWA icons (64, 180, 192, 512) + favicon |
| **Mobile MSC Template** | `templates.mobile.mscJsonPath` | Copies JSON to `sheetdata1.json` (project root) |
| **Tablet MSC Template** | `templates.tablet.mscJsonPath` | Copies JSON to `sheetdata.json` (project root) |

## data.json Structure

```jsonc
{
  "app": {
    "name": "My App",            // Human-readable app name
    "kebabName": "my-app",       // package.json name (lowercase, hyphens)
    "packageName": "com.example.myapp",  // Bundle ID
    "description": "...",        // package.json description
    "type": "invoice",           // App type identifier
    "version": "1.0.0",          // Semver for package.json
    "marketingVersion": "1.0",   // iOS MARKETING_VERSION
    "buildNumber": "1"           // iOS CURRENT_PROJECT_VERSION
  },
  "theme": {
    "primaryColor": "#3880ff",
    "primaryColorRgb": "56, 128, 255",
    "primaryColorShade": "#3171e0",
    "primaryColorTint": "#4c8dff",
    "primaryContrast": "#ffffff",
    "primaryContrastRgb": "255, 255, 255",
    "secondaryColor": "#...",
    // ... secondary variants
    "backgroundColor": "#f4f5f8"
  },
  "onboarding": {
    "welcomeTitle": "Welcome to My App",
    "welcomeSubtitle": "One-line app description.",
    "features": [
      "Feature 1 description",
      "Feature 2 description",
      "Feature 3 description"
    ],
    "ctaButtonText": "Get Started"
  },
  "pages": {
    "dashboardHeaderTitle": "My App",
    "filesPageHeaderTitle": "My Saved Files",
    "settingsPageAppName": "My App",
    "settingsPageMarketingVersion": "1.0",
    "settingsPageBuildNumber": "1.0",
    "settingsCurrencyDescription": "...",
    "settingsResetDescription": "..."
  },
  "tabs": {
    "home": "Home",
    "files": "Files",
    "settings": "Settings"
  },
  "templates": {
    "appType": "invoice",
    "hashtags": ["invoice", "finance"],
    "mobile": { "name": "...", "description": "...", "mscJsonPath": "" },
    "tablet": { "name": "...", "description": "...", "mscJsonPath": "" },
    "desktop": { "name": "...", "description": "...", "mscJsonPath": "" },
    "footerTabNames": { "tab1": "Sheet 1", "tab2": "Sheet 2" }
  },
  "pdf": {
    "footerLabel": "My App",
    "defaultFilename": "my_file",
    "defaultAllSheetsFilename": "all_files",
    "shareSubject": "Here is your file",
    "shareText": "PDF generated successfully",
    "csvShareText": "Data exported as CSV",
    "singleSheetName": "My Sheet"
  },
  "menu": {
    "printWindowTitle": "Print My File",
    "emailSubject": "Here is your file",
    "saveToastMessage": "Data saved successfully!",
    "fallbackFileName": "My File"
  },
  "ios": {
    "displayName": "My App",
    "cameraUsageDescription": "...",
    "photoLibraryUsageDescription": "...",
    "microphoneUsageDescription": "..."
  },
  "pwa": {
    "shortName": "My App",
    "fullName": "My App",
    "themeColor": "#3880ff",
    "backgroundColor": "#3880ff"
  },
  "icon": {
    "sourceIconPath": "/absolute/path/to/1024x1024.png"
  }
}
```

## Requirements

- **bash** ≥ 4
- **python3** (ships with macOS)
- **sips** (macOS, for icon resizing — only needed if using icon updates)

## Workflow

1. Edit `scripts/app-update-automation/data.json`
2. Run: `bash scripts/app-update-automation/update-app.sh`
3. Review: `git diff`
4. Test: `npm run dev`
5. Build: `ionic build && npx cap sync`
