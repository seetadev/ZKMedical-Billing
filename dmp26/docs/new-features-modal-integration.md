# New Features Modal Integration & Release Protocol

## Overview
A new features / what's-new showcase modal (`NewFeaturesModal`) has been integrated into `DashboardHome.tsx` to automatically present feature video walkthroughs and formula guides on first launch, and record the read status to prevent repetitive popups.

## Architecture

### Component: `NewFeaturesModal`
- **Path**: `src/components/NewFeatures/NewFeaturesModal.tsx`
- **Styles**: `src/components/NewFeatures/NewFeaturesModal.css`
- **Underlying Engine**: Wraps `DemoVideosModal` from `socialcalc-ai` with customized "✨ New Features" header styling and release state tracking.

### Storage Key & Read Flagging
- **Storage Key**: `invoicecalc_new_features_read_v1`
- **Helper Utilities**:
  - `hasSeenNewFeatures(key?)`: Checks if user has already seen this release modal.
  - `markNewFeaturesAsSeen(key?)`: Marks the version as read in `localStorage`.
  - `resetNewFeaturesSeen(key?)`: Clears the flag (useful for debugging or resets).

### How to use for future releases
When releasing a new version with new features or tutorial updates:
1. In `src/components/NewFeatures/NewFeaturesModal.tsx`, update `NEW_FEATURES_STORAGE_KEY` (e.g. `invoicecalc_new_features_read_v2`).
2. Optionally pass custom video lists or items via the `videos` prop.
3. Every user upgrading to the new release will automatically see the modal once upon reaching the Dashboard, and it will be flagged as read once closed.
