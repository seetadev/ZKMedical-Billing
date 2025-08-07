# App Icons and Splash Screen Documentation

This document provides a comprehensive guide for generating and implementing app icons, splash screens, and favicons for the Government Billing Solution MVP app.

## 🎨 Design Tools Used

### 1. App Icons for Android

**Tool:** [EasyAppIcon.com](https://easyappicon.com/)

- **Purpose:** Generate all required app icon sizes for Android mipmaps
- **Input:** Upload your base icon (preferably 1024x1024 PNG)
- **Output:** Complete set of Android icon sizes

### 2. Splash Screens

**Tool:** [APE Tools Image Gorilla](https://apetools.webprofusion.com/#/tools/imagegorilla)

- **Purpose:** Generate splash screen images for different screen densities
- **Input:** Your splash screen design
- **Output:** Multiple sizes for different Android screen densities

### 3. Favicons for Web

**Tool:** [Favicon.io](https://favicon.io/)

- **Purpose:** Generate web favicons and PWA icons
- **Input:** Your base icon or text
- **Output:** Complete favicon package

## 📁 File Structure and Placement

### Android App Icons

Generated icons should be placed in the following directories:

```
android/app/src/main/res/
├── mipmap-ldpi/
│   ├── ic_launcher.png (36x36)
│   ├── ic_launcher_foreground.png
│   └── ic_launcher_round.png
├── mipmap-mdpi/
│   ├── ic_launcher.png (48x48)
│   ├── ic_launcher_foreground.png
│   └── ic_launcher_round.png
├── mipmap-hdpi/
│   ├── ic_launcher.png (72x72)
│   ├── ic_launcher_foreground.png
│   └── ic_launcher_round.png
├── mipmap-xhdpi/
│   ├── ic_launcher.png (96x96)
│   ├── ic_launcher_foreground.png
│   └── ic_launcher_round.png
├── mipmap-xxhdpi/
│   ├── ic_launcher.png (144x144)
│   ├── ic_launcher_foreground.png
│   └── ic_launcher_round.png
└── mipmap-xxxhdpi/
    ├── ic_launcher.png (192x192)
    ├── ic_launcher_foreground.png
    └── ic_launcher_round.png
```

### Android Splash Screens

Splash screen images should be placed in:

```
android/app/src/main/res/
├── drawable/
│   └── splash.png (default)
├── drawable-land-hdpi/
│   └── splash.png
├── drawable-land-mdpi/
│   └── splash.png
├── drawable-land-xhdpi/
│   └── splash.png
├── drawable-land-xxhdpi/
│   └── splash.png
├── drawable-land-xxxhdpi/
│   └── splash.png
├── drawable-port-hdpi/
│   └── splash.png
├── drawable-port-mdpi/
│   └── splash.png
├── drawable-port-xhdpi/
│   └── splash.png
├── drawable-port-xxhdpi/
│   └── splash.png
└── drawable-port-xxxhdpi/
    └── splash.png
```

### Web Favicons and PWA Icons

Place generated favicons in the `public/` directory:

```
public/
├── favicon.ico
├── favicon.png
├── favicon.svg (optional but recommended)
├── apple-touch-icon.png (180x180)
├── pwa-64x64.png
├── pwa-192x192.png
├── pwa-512x512.png
└── maskable-icon-512x512.png
```

## 🎨 Background Color Configuration

### App Icon Background Color: `#6F3EFC`

The app icon background color was changed from white/teal to purple (`#6F3EFC`) in the following files:

#### 1. Values Color Resource

**File:** `android/app/src/main/res/values/ic_launcher_background.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#6F3EFC</color>
</resources>
```

#### 2. Vector Drawable Background

**File:** `android/app/src/main/res/drawable/ic_launcher_background.xml`

```xml
<path
    android:fillColor="#6F3EFC"
    android:pathData="M0,0h108v108h-108z" />
```

### Splash Screen Background Color: `#6F3EFC`

The splash screen background was configured to use the same purple color:

#### 1. Color Definitions

**File:** `android/app/src/main/res/values/colors.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#6F3EFC</color>
    <color name="colorPrimaryDark">#5A32D1</color>
    <color name="colorAccent">#6F3EFC</color>
    <color name="splash_background">#6F3EFC</color>
</resources>
```

#### 2. Splash Screen Style

**File:** `android/app/src/main/res/values/styles.xml`

```xml
<style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
    <item name="android:background">@color/splash_background</item>
    <item name="android:windowBackground">@color/splash_background</item>
</style>
```

## 🛠 Implementation Steps

### Step 1: Generate Icons

1. **Create base icon** (1024x1024 PNG) with transparent background
2. **Generate Android icons** using [EasyAppIcon.com](https://easyappicon.com/)
3. **Generate web favicons** using [Favicon.io](https://favicon.io/)
4. **Generate splash screens** using [APE Tools Image Gorilla](https://apetools.webprofusion.com/#/tools/imagegorilla)

### Step 2: Android Implementation

1. **Replace generated icons** in respective mipmap folders
2. **Replace splash screens** in drawable folders
3. **Update background colors** in the configuration files mentioned above

### Step 3: Web Implementation

1. **Copy favicons** to `public/` directory
2. **Update `manifest.json`** to reference correct icon paths
3. **Verify `index.html`** has correct favicon references

### Step 4: Build and Test

```bash
# Clean and rebuild Android
cd android
./gradlew clean
./gradlew build

# Or use Ionic/Capacitor
ionic capacitor run android
```

## 📱 Icon Specifications

### Android App Icons

- **Adaptive Icons:** 108x108dp with 72x72dp safe zone
- **Legacy Icons:** Various sizes from 36x36 to 192x192
- **Format:** PNG with transparency
- **Background:** Solid color or vector drawable

### Splash Screens

- **Orientation:** Both portrait and landscape
- **Densities:** ldpi, mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi
- **Format:** PNG
- **Background:** Should match app theme

### Web Favicons

- **ICO:** 16x16, 32x32, 48x48 (multi-size)
- **PNG:** 16x16, 32x32, 64x64, 192x192, 512x512
- **SVG:** Scalable vector (optional)
- **Apple Touch:** 180x180

## ✅ Verification Checklist

- [ ] All Android mipmap folders contain appropriate icons
- [ ] All splash screen drawable folders have images
- [ ] Background colors are consistently set to `#6F3EFC`
- [ ] Web favicon files are in `public/` directory
- [ ] `manifest.json` references correct icon paths
- [ ] App builds without icon-related errors
- [ ] Icons display correctly on device/emulator
- [ ] Splash screen shows purple background

## 🎨 Brand Colors Used

- **Primary:** `#6F3EFC` (Purple)
- **Primary Dark:** `#5A32D1` (Darker Purple)
- **Accent:** `#6F3EFC` (Purple)
- **Background:** `#6F3EFC` (Purple)

---

**Note:** Always test icons on actual devices to ensure they display correctly across different screen densities and Android versions.
