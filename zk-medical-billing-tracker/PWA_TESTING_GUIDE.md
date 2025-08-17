# PWA Testing Guide for ZK Medical Billing Invoice Tracker

## PWA Features Implemented

### 1. Service Worker & Offline Capabilities
- ✅ Automatic service worker registration with VitePWA
- ✅ Cache-first strategy for static assets
- ✅ Offline support for core functionality
- ✅ Auto-update mechanism for PWA updates

### 2. Web App Manifest
- ✅ Complete manifest.json with proper app metadata
- ✅ App name: "ZK Medical Billing Invoice Tracker"
- ✅ Short name: "ZK Medical Bills"
- ✅ Theme color: #3880ff (Ionic Blue)
- ✅ Display mode: standalone
- ✅ Start URL configured

### 3. Icons & Assets
- ✅ Generated multiple icon sizes (64x64, 192x192, 512x512)
- ✅ Maskable icon for Android adaptive icons
- ✅ Apple touch icon for iOS
- ✅ Favicon for desktop browsers

## Testing Instructions

### Desktop Browser Testing

#### Chrome/Edge:
1. Open the development server: http://localhost:5173/
2. Open DevTools (F12) → Application tab → Manifest
3. Verify manifest loads correctly with all metadata
4. Click "Install" button in address bar or use PWA install prompt
5. Test offline functionality by going to Network tab → checking "Offline"
6. Verify app loads and basic functionality works offline

#### Firefox:
1. Navigate to the app URL
2. Test responsiveness and PWA features
3. Check Console for any PWA-related errors

### Mobile Testing

#### Android (Chrome):
1. Open Chrome on Android device
2. Navigate to the deployed app URL
3. Menu → "Add to Home screen" or use install banner
4. Test installed PWA from home screen
5. Verify it opens in standalone mode (no browser UI)
6. Test offline functionality by enabling airplane mode

#### iOS (Safari):
1. Open Safari on iOS device
2. Navigate to the app URL
3. Share button → "Add to Home Screen"
4. Test installed web app from home screen
5. Verify it behaves like a native app

### Feature Testing Checklist

#### Basic PWA Features:
- [ ] App installs correctly on desktop
- [ ] App installs correctly on mobile
- [ ] App opens in standalone mode
- [ ] App icon appears correctly on home screen/desktop
- [ ] App works offline for cached content
- [ ] App updates automatically when new version available
- [ ] Splash screen appears on mobile (if configured)

#### Invoice App Features:
- [ ] Simple invoice creation works
- [ ] Multi-sheet invoice creation works
- [ ] Form validation works properly
- [ ] Data persistence works
- [ ] Firebase integration works
- [ ] AdMob ads display (on mobile build)

### Performance Testing

#### Lighthouse Audit:
1. Open DevTools → Lighthouse tab
2. Select "Progressive Web App" category
3. Run audit and aim for score > 90
4. Check for PWA criteria compliance

#### Core Web Vitals:
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] First Input Delay < 100ms

### Device-Specific Testing

#### Android Devices:
- [ ] Pixel phones (various sizes)
- [ ] Samsung Galaxy devices
- [ ] OnePlus devices
- [ ] Test both portrait and landscape orientations

#### iOS Devices:
- [ ] iPhone (various sizes: SE, 12, 13, 14, Pro Max)
- [ ] iPad (regular and Pro)
- [ ] Test both portrait and landscape orientations

#### Desktop:
- [ ] Windows 10/11 (Chrome, Edge, Firefox)
- [ ] macOS (Chrome, Safari, Firefox)
- [ ] Linux (Chrome, Firefox)

### Troubleshooting Common Issues

#### PWA Not Installing:
- Check manifest.json is accessible
- Verify HTTPS (required for PWA)
- Check service worker registration
- Ensure all required manifest fields are present

#### Offline Not Working:
- Check service worker caching strategy
- Verify critical resources are cached
- Test with DevTools Network throttling

#### Icons Not Showing:
- Check icon paths in manifest
- Verify icon files exist and are accessible
- Test different icon sizes on various devices

### AdMob Testing (Mobile Build Only)

#### Android Testing:
1. Build APK with `npx cap build android`
2. Install APK on test device
3. Verify banner ads load correctly
4. Test ad placement doesn't interfere with UI
5. Check ad loading performance

#### Testing Checklist:
- [ ] Ads load on Invoices page (top position)
- [ ] Ads load on NewInvoice page (bottom position)
- [ ] Ads hide when navigating away from pages
- [ ] No memory leaks from ad loading
- [ ] App performance remains smooth with ads

## Build Commands

### Development:
```bash
npm run dev
```

### Production Build:
```bash
npm run build
```

### PWA Asset Generation:
```bash
npm run generate-pwa-assets
```

### Android Build:
```bash
npx cap build android
```

### iOS Build:
```bash
npx cap build ios
```

## Notes

- Replace test AdMob IDs with production IDs before release
- Configure proper Firebase project for production
- Test on real devices for accurate performance metrics
- Ensure HTTPS for production deployment (PWA requirement)
- Consider implementing push notifications for enhanced PWA experience