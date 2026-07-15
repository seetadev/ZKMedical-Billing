# Theme Customization Settings Documentation

This document describes the design and implementation of the theme customization settings feature in the application.

## Overview
A dynamic theme settings selection menu has been added to the application under **Settings -> Preferences**. This allows users to choose between various pre-configured color palettes that instantly style primary colors, secondary colors, backgrounds, and active selections offline.

## Architecture

### 1. Theme Configuration Preset (`src/pages/settings.json`)
The preset themes are defined in a central JSON file. Each theme object must follow this structure:
```json
{
  "id": "theme-id-string",
  "name": "User Facing Theme Name",
  "colors": {
    "primaryColor": "#primary-hex",
    "primaryColorRgb": "r, g, b",
    "primaryColorShade": "#shade-hex",
    "primaryColorTint": "#tint-hex",
    "primaryContrast": "#contrast-hex",
    "primaryContrastRgb": "r, g, b",
    "secondaryColor": "#secondary-hex",
    "secondaryColorRgb": "r, g, b",
    "secondaryContrast": "#sec-contrast-hex",
    "secondaryContrastRgb": "r, g, b",
    "secondaryShade": "#sec-shade-hex",
    "secondaryTint": "#sec-tint-hex",
    "backgroundColor": "#bg-hex"
  }
}
```

### 2. Style Injection Utility (`src/utils/theme.ts`)
The `applyTheme` utility function accepts a theme's color dictionary and injects them as inline CSS variables on `document.documentElement.style`. This overrides default Ionic variables configured in `src/theme/variables.css` globally.

### 3. Context & Persistence State (`src/contexts/InvoiceContext.tsx`)
*   Manages the `theme` reactively under the `InvoiceProvider`.
*   Restores the saved theme key from `localStorage` under `home_maintenance_settings` when the application mounts.
*   Triggers the `applyTheme` hook whenever the selected theme changes, ensuring the custom theme styles are present globally instantly.

### 4. Settings Interface (`src/pages/SettingsPage.tsx`)
A theme selector card containing a popover `IonSelect` interface has been added in settings. This exposes all preset options registered inside `settings.json` and updates the app theme instantly when changed.
