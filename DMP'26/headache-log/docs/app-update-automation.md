# App Update Automation — Changelog

## Created: 2025-06-14

### Summary

Built a centralized app-update automation system at `scripts/app-update-automation/` that patches **19 project files** from a single `data.json` configuration.

### Files Created

| File | Purpose |
|------|---------|
| `scripts/app-update-automation/data.json` | Central JSON config with all updatable values |
| `scripts/app-update-automation/update-app.sh` | Bash script that reads data.json and patches all files |
| `scripts/app-update-automation/README.md` | Usage documentation |

### Architecture

- The script uses **python3 inline** (via heredoc) for regex-based file patching — no `jq` or npm dependency needed.
- Each file update is a self-contained python block that reads the file, applies regex substitutions, and writes back.
- The script is **idempotent** — running it with the same data.json produces the same output.
- Icon generation uses `sips` (macOS built-in) for resizing.

### Updatable Fields (23 changes per run)

The data.json covers:
- **App identity**: name, kebab-name, package ID, description, version, build number
- **Theme**: primary color (6 properties), secondary color (6 properties), background color
- **Onboarding**: welcome title, subtitle, 3 feature bullets, CTA button text
- **Page text**: dashboard header, files page header, settings display values, currency/reset descriptions
- **Tabs**: Home/Files/Settings labels
- **Templates**: mobile/tablet/desktop names, descriptions, hashtags, app type, footer tab names
- **PDF/Export**: footer label, default filenames, share subjects, share texts
- **Menu**: print window title, email subject, save toast, fallback filename
- **iOS**: display name, camera/photo/microphone usage descriptions
- **PWA**: short name, full name, theme color, background color
- **Xcode**: MARKETING_VERSION, CURRENT_PROJECT_VERSION
- **Icons**: source PNG path for auto-generating all iOS + PWA + favicon variants
- **MSC Templates**: paths to mobile/tablet JSON template files
