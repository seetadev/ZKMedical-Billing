#!/usr/bin/env bash
###############################################################################
#  App Update Automation Script
#  ─────────────────────────────
#  Reads scripts/app-update-automation/data.json and patches every
#  configurable file in the project so you can rebrand / version-bump
#  the entire app from a single JSON manifest.
#
#  Usage:  bash scripts/app-update-automation/update-app.sh
#          (Run from the project root — the Invoice directory)
#
#  Requirements: bash ≥ 4, python3 (ships with macOS), sips (macOS)
###############################################################################
set -euo pipefail

# ── Resolve paths ───────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DATA_JSON="$SCRIPT_DIR/data.json"

if [[ ! -f "$DATA_JSON" ]]; then
  echo "❌  data.json not found at $DATA_JSON" >&2
  exit 1
fi

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          App Update Automation — Starting…                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📂 Project root : $PROJECT_ROOT"
echo "📄 Config file  : $DATA_JSON"
echo ""

# ── Helper: read a key from data.json ────────────────────────────────────────
# Uses python3 so we don't need jq as a dependency.
json() {
  python3 -c "
import json, sys
with open('$DATA_JSON') as f:
    d = json.load(f)
keys = '$1'.split('.')
for k in keys:
    if isinstance(d, list):
        d = d[int(k)]
    else:
        d = d[k]
if isinstance(d, list):
    print('\n'.join(str(i) for i in d))
else:
    print(d)
"
}

# Read a JSON array as a bash array (one element per line)
json_array() {
  python3 -c "
import json
with open('$DATA_JSON') as f:
    d = json.load(f)
keys = '$1'.split('.')
for k in keys:
    if isinstance(d, list):
        d = d[int(k)]
    else:
        d = d[k]
for item in d:
    print(item)
"
}

# ── Read all values ──────────────────────────────────────────────────────────
APP_NAME=$(json "app.name")
APP_KEBAB=$(json "app.kebabName")
APP_PKG=$(json "app.packageName")
APP_DESC=$(json "app.description")
APP_TYPE=$(json "app.type")
APP_VERSION=$(json "app.version")
APP_MKT_VER=$(json "app.marketingVersion")
APP_BUILD=$(json "app.buildNumber")

PRIMARY=$(json "theme.primaryColor")
PRIMARY_RGB=$(json "theme.primaryColorRgb")
PRIMARY_SHADE=$(json "theme.primaryColorShade")
PRIMARY_TINT=$(json "theme.primaryColorTint")
PRIMARY_CONTRAST=$(json "theme.primaryContrast")
PRIMARY_CONTRAST_RGB=$(json "theme.primaryContrastRgb")
SECONDARY=$(json "theme.secondaryColor")
SECONDARY_RGB=$(json "theme.secondaryColorRgb")
SECONDARY_CONTRAST=$(json "theme.secondaryContrast")
SECONDARY_CONTRAST_RGB=$(json "theme.secondaryContrastRgb")
SECONDARY_SHADE=$(json "theme.secondaryShade")
SECONDARY_TINT=$(json "theme.secondaryTint")
BG_COLOR=$(json "theme.backgroundColor")

ONBOARD_TITLE=$(json "onboarding.welcomeTitle")
ONBOARD_SUBTITLE=$(json "onboarding.welcomeSubtitle")
ONBOARD_CTA=$(json "onboarding.ctaButtonText")

DASH_HEADER=$(json "pages.dashboardHeaderTitle")
FILES_HEADER=$(json "pages.filesPageHeaderTitle")
SETTINGS_NAME=$(json "pages.settingsPageAppName")
SETTINGS_MKT_VER=$(json "pages.settingsPageMarketingVersion")
SETTINGS_BUILD=$(json "pages.settingsPageBuildNumber")
SETTINGS_CURRENCY_DESC=$(json "pages.settingsCurrencyDescription")
SETTINGS_RESET_DESC=$(json "pages.settingsResetDescription")

TAB_HOME=$(json "tabs.home")
TAB_FILES=$(json "tabs.files")
TAB_SETTINGS=$(json "tabs.settings")

TPL_TYPE=$(json "templates.appType")
TPL_MOBILE_NAME=$(json "templates.mobile.name")
TPL_MOBILE_DESC=$(json "templates.mobile.description")
TPL_MOBILE_MSC=$(json "templates.mobile.mscJsonPath")
TPL_TABLET_NAME=$(json "templates.tablet.name")
TPL_TABLET_DESC=$(json "templates.tablet.description")
TPL_TABLET_MSC=$(json "templates.tablet.mscJsonPath")
TPL_DESKTOP_NAME=$(json "templates.desktop.name")
TPL_DESKTOP_DESC=$(json "templates.desktop.description")
TPL_DESKTOP_MSC=$(json "templates.desktop.mscJsonPath")
TPL_FOOTER_1=$(json "templates.footerTabNames.tab1")
TPL_FOOTER_2=$(json "templates.footerTabNames.tab2")

PDF_FOOTER=$(json "pdf.footerLabel")
PDF_FILENAME=$(json "pdf.defaultFilename")
PDF_ALL_FILENAME=$(json "pdf.defaultAllSheetsFilename")
PDF_SHARE_SUBJECT=$(json "pdf.shareSubject")
PDF_SHARE_TEXT=$(json "pdf.shareText")
PDF_CSV_TEXT=$(json "pdf.csvShareText")
PDF_SHEET_NAME=$(json "pdf.singleSheetName")

MENU_PRINT_TITLE=$(json "menu.printWindowTitle")
MENU_EMAIL_SUBJECT=$(json "menu.emailSubject")
MENU_SAVE_TOAST=$(json "menu.saveToastMessage")
MENU_FALLBACK=$(json "menu.fallbackFileName")

IOS_DISPLAY=$(json "ios.displayName")
IOS_CAMERA=$(json "ios.cameraUsageDescription")
IOS_PHOTO=$(json "ios.photoLibraryUsageDescription")
IOS_MIC=$(json "ios.microphoneUsageDescription")

PWA_SHORT=$(json "pwa.shortName")
PWA_FULL=$(json "pwa.fullName")
PWA_THEME=$(json "pwa.themeColor")
PWA_BG=$(json "pwa.backgroundColor")

ICON_SRC=$(json "icon.sourceIconPath")

# Read features array
FEATURES=()
while IFS= read -r line; do
  FEATURES+=("$line")
done < <(json_array "onboarding.features")

# Read hashtags array
HASHTAGS_RAW=()
while IFS= read -r line; do
  HASHTAGS_RAW+=("$line")
done < <(json_array "templates.hashtags")

# Count of changes
CHANGE_COUNT=0
step() { CHANGE_COUNT=$((CHANGE_COUNT + 1)); echo "  [$CHANGE_COUNT] $1"; }

###############################################################################
# 1. capacitor.config.ts
###############################################################################
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦  1/14  capacitor.config.ts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FILE="$PROJECT_ROOT/capacitor.config.ts"
python3 - "$FILE" <<PYEOF
import re, sys
f = sys.argv[1]
txt = open(f).read()
txt = re.sub(r'(appId:\s*")[^"]*(")', r'\g<1>$APP_PKG\2', txt)
txt = re.sub(r'(appName:\s*")[^"]*(")', r'\g<1>$APP_NAME\2', txt)
txt = re.sub(r'(backgroundColor:\s*")[^"]*(")', r'\g<1>$BG_COLOR\2', txt)
open(f, 'w').write(txt)
PYEOF
step "Updated appId → $APP_PKG"
step "Updated appName → $APP_NAME"

###############################################################################
# 2. package.json
###############################################################################
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦  2/14  package.json"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FILE="$PROJECT_ROOT/package.json"
python3 - "$FILE" <<PYEOF
import json, sys
f = sys.argv[1]
pkg = json.load(open(f))
pkg['name'] = "$APP_KEBAB"
pkg['version'] = "$APP_VERSION"
pkg['description'] = "$APP_DESC"
json.dump(pkg, open(f, 'w'), indent=2)
# Ensure trailing newline
with open(f, 'a') as fh:
    fh.write('\n')
PYEOF
step "Updated name → $APP_KEBAB"
step "Updated version → $APP_VERSION"
step "Updated description"

###############################################################################
# 3. ionic.config.json
###############################################################################
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦  3/14  ionic.config.json"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FILE="$PROJECT_ROOT/ionic.config.json"
python3 - "$FILE" <<PYEOF
import json, sys
f = sys.argv[1]
cfg = json.load(open(f))
cfg['name'] = "$APP_NAME"
json.dump(cfg, open(f, 'w'), indent=2)
with open(f, 'a') as fh:
    fh.write('\n')
PYEOF
step "Updated name → $APP_NAME"

###############################################################################
# 4. index.html
###############################################################################
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦  4/13  index.html"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FILE="$PROJECT_ROOT/index.html"
python3 - "$FILE" <<PYEOF
import re, sys
f = sys.argv[1]
txt = open(f).read()
txt = re.sub(r'<title>[^<]*</title>', '<title>$APP_NAME</title>', txt)
txt = re.sub(r'(apple-mobile-web-app-title"\s+content=")[^"]*(")', r'\g<1>$APP_NAME\2', txt)
open(f, 'w').write(txt)
PYEOF
step "Updated <title> → $APP_NAME"
step "Updated apple-mobile-web-app-title → $APP_NAME"

###############################################################################
# 5. public/manifest.json (PWA)
###############################################################################
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦  5/13  public/manifest.json"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FILE="$PROJECT_ROOT/public/manifest.json"
python3 - "$FILE" <<PYEOF
import json, sys
f = sys.argv[1]
m = json.load(open(f))
m['short_name'] = "$PWA_SHORT"
m['name'] = "$PWA_FULL"
m['theme_color'] = "$PWA_THEME"
m['background_color'] = "$PWA_BG"
json.dump(m, open(f, 'w'), indent=2)
with open(f, 'a') as fh:
    fh.write('\n')
PYEOF
step "Updated PWA manifest names, theme_color, background_color"

###############################################################################
# 6. public/templates/meta/*.json  (Template metadata)
###############################################################################
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦  6/13  public/templates/meta/*.json"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
python3 - "$DATA_JSON" "$PROJECT_ROOT" <<'PYEOF'
import json, sys, os

data_json = sys.argv[1]
project_root = sys.argv[2]

with open(data_json) as f:
    data = json.load(f)

tpl = data["templates"]
htags = tpl["hashtags"]

# Mobile meta
mobile_meta = {
    "isPremium": False,
    "price": {"USD": 0},
    "name": tpl["mobile"]["name"],
    "type": tpl["appType"],
    "device": "mobile",
    "description": tpl["mobile"]["description"],
    "id": 100001,
    "image": "",
    "hashtags": htags + ["mobile"]
}
with open(os.path.join(project_root, "public/templates/meta/mobile-meta.json"), 'w') as f:
    json.dump(mobile_meta, f, indent=2)
    f.write('\n')

# Tablet meta
tablet_meta = {
    "isPremium": False,
    "price": {"USD": 0},
    "name": tpl["tablet"]["name"],
    "type": tpl["appType"],
    "device": "tablet",
    "description": tpl["tablet"]["description"],
    "id": 100002,
    "image": "",
    "hashtags": htags + ["tablet"]
}
with open(os.path.join(project_root, "public/templates/meta/tablet-meta.json"), 'w') as f:
    json.dump(tablet_meta, f, indent=2)
    f.write('\n')
PYEOF
step "Updated mobile-meta.json and tablet-meta.json"

###############################################################################
# 7. src/theme/variables.css  (Primary & Secondary colors)
###############################################################################
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦  7/13  src/theme/variables.css"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FILE="$PROJECT_ROOT/src/theme/variables.css"
python3 - "$FILE" "$DATA_JSON" <<'PYEOF'
import re, sys, json

f = sys.argv[1]
data_json = sys.argv[2]
txt = open(f).read()

with open(data_json) as jf:
    data = json.load(jf)

theme = data["theme"]

replacements = {
    "--ion-color-primary:":            theme["primaryColor"],
    "--ion-color-primary-rgb:":        theme["primaryColorRgb"],
    "--ion-color-primary-contrast:":   theme["primaryContrast"],
    "--ion-color-primary-contrast-rgb:": theme["primaryContrastRgb"],
    "--ion-color-primary-shade:":      theme["primaryColorShade"],
    "--ion-color-primary-tint:":       theme["primaryColorTint"],
    "--ion-color-secondary:":          theme["secondaryColor"],
    "--ion-color-secondary-rgb:":      theme["secondaryColorRgb"],
    "--ion-color-secondary-contrast:": theme["secondaryContrast"],
    "--ion-color-secondary-contrast-rgb:": theme["secondaryContrastRgb"],
    "--ion-color-secondary-shade:":    theme["secondaryShade"],
    "--ion-color-secondary-tint:":     theme["secondaryTint"],
}

for prop, val in replacements.items():
    pattern = r'(' + re.escape(prop) + r'\s*)([^;]+)(;)'
    txt = re.sub(pattern, r'\g<1>' + val + r'\3', txt)

open(f, 'w').write(txt)
PYEOF

step "Updated primary + secondary CSS color tokens"

###############################################################################
# 8. src/pages/OnboardingPage.tsx
###############################################################################
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦  8/13  src/pages/OnboardingPage.tsx"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FILE="$PROJECT_ROOT/src/pages/OnboardingPage.tsx"
python3 - "$FILE" "$DATA_JSON" <<'PYEOF'
import re, sys, json

f = sys.argv[1]
data_json = sys.argv[2]
txt = open(f).read()

with open(data_json) as jf:
    data = json.load(jf)

ob = data["onboarding"]
features = ob["features"]

# 1) Welcome title
txt = re.sub(
    r'(<h1\s+className="step-title">)[^<]*(</h1>)',
    r'\g<1>' + ob["welcomeTitle"] + r'\2',
    txt
)

# 2) Welcome subtitle
txt = re.sub(
    r'(<p\s+className="step-subtitle">)[^<]*(</p>)',
    r'\g<1>' + ob["welcomeSubtitle"] + r'\2',
    txt
)

# 3) Feature items — replace the <span> text inside each feature-item div
# Find all <span> inside feature-item blocks
spans = list(re.finditer(r'(<div\s+className="feature-item">\s*<IonIcon[^/]*/>\s*<span>)([^<]*)(</span>)', txt))
for i, m in enumerate(spans):
    if i < len(features):
        old = m.group(0)
        new = m.group(1) + features[i] + m.group(3)
        txt = txt.replace(old, new, 1)

# 4) CTA button text
# Match the text content inside the action-btn IonButton
txt = re.sub(
    r'(className="action-btn"[^>]*>\s*\n\s*)([^\n<]+)(\s*\n\s*</IonButton>)',
    r'\g<1>' + ob["ctaButtonText"] + r'\3',
    txt
)

open(f, 'w').write(txt)
PYEOF
step "Updated welcome title, subtitle, features, CTA"

###############################################################################
# 9. src/pages/SettingsPage.tsx
###############################################################################
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦  9/13  src/pages/SettingsPage.tsx"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FILE="$PROJECT_ROOT/src/pages/SettingsPage.tsx"
python3 - "$FILE" "$DATA_JSON" <<'PYEOF'
import re, sys, json

f = sys.argv[1]
data_json = sys.argv[2]
txt = open(f).read()

with open(data_json) as jf:
    data = json.load(jf)

pages = data["pages"]

# Currency description
txt = re.sub(
    r'(className="settings-card-desc">)Change the display currency[^<]*(</p>)',
    r'\g<1>' + pages["settingsCurrencyDescription"] + r'\2',
    txt
)

# Reset description
txt = re.sub(
    r'(className="settings-card-desc">)Wipe all local[^<]*(</p>)',
    r'\g<1>' + pages["settingsResetDescription"] + r'\2',
    txt
)

# App Name display
txt = re.sub(
    r'(<span\s+className="info-value">)[^<]*(</span>\s*\n\s*</div>\s*\n\s*<div\s+className="info-row">\s*\n\s*<span\s+className="info-label">Marketing Version)',
    r'\g<1>' + pages["settingsPageAppName"] + r'\2',
    txt
)

# Marketing Version
app_mkt_ver = data.get("app", {}).get("marketingVersion", pages.get("settingsPageMarketingVersion", "1.0"))
txt = re.sub(
    r'(Marketing Version</span>\s*\n\s*<span\s+className="info-value">)[^<]*(</span>)',
    r'\g<1>' + app_mkt_ver + r'\2',
    txt
)

# Build Number
app_build = data.get("app", {}).get("buildNumber", pages.get("settingsPageBuildNumber", "1"))
txt = re.sub(
    r'(Build Number</span>\s*\n\s*<span\s+className="info-value">)[^<]*(</span>)',
    r'\g<1>' + app_build + r'\2',
    txt
)

open(f, 'w').write(txt)
PYEOF
step "Updated Settings: app name, version, build, descriptions"

###############################################################################
# 10. src/components/DashboardLayout.tsx
###############################################################################
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 10/13  src/components/DashboardLayout.tsx"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FILE="$PROJECT_ROOT/src/components/DashboardLayout.tsx"
python3 - "$FILE" "$DATA_JSON" <<'PYEOF'
import re, sys, json
f = sys.argv[1]
data_json = sys.argv[2]
txt = open(f).read()

with open(data_json) as jf:
    data = json.load(jf)

app_name = data["app"]["name"]
dash_header = data["pages"]["dashboardHeaderTitle"]

# Header h1 text
txt = re.sub(
    r'(<h1[^>]*>)[^<]*(</h1>)',
    r'\g<1>' + dash_header + r'\2',
    txt
)

# Rent receipt files limit message
txt = re.sub(
    r'rent receipt files',
    app_name.lower() + ' files',
    txt,
    flags=re.IGNORECASE
)

open(f, 'w').write(txt)
PYEOF
step "Updated dashboard header and file limit message"

###############################################################################
# 11. src/pages/FilesPage.tsx
###############################################################################
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 11/13  src/pages/FilesPage.tsx"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FILE="$PROJECT_ROOT/src/pages/FilesPage.tsx"
python3 - "$FILE" <<PYEOF
import re, sys
f = sys.argv[1]
txt = open(f).read()
txt = re.sub(
    r'(<IonTitle[^>]*>)[^<]*(</IonTitle>)',
    r'\g<1>$FILES_HEADER\2',
    txt
)
open(f, 'w').write(txt)
PYEOF
step "Updated files page header → $FILES_HEADER"

###############################################################################
# 12. src/App.tsx  (Tab labels)
###############################################################################
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 12/13  src/App.tsx  (tab labels)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FILE="$PROJECT_ROOT/src/App.tsx"
python3 - "$FILE" "$DATA_JSON" <<'PYEOF'
import re, sys, json

f = sys.argv[1]
data_json = sys.argv[2]
txt = open(f).read()

with open(data_json) as jf:
    data = json.load(jf)

tabs = data["tabs"]

# Replace tab labels: <IonTabButton tab="home" ...><IonIcon .../><IonLabel>Home</IonLabel>
for tab_key, label in tabs.items():
    pattern = r'(tab="' + tab_key + r'"[^>]*>\s*<IonIcon[^/]*/>\s*<IonLabel>)[^<]*(</IonLabel>)'
    txt = re.sub(pattern, r'\g<1>' + label + r'\2', txt, flags=re.DOTALL)

open(f, 'w').write(txt)
PYEOF
step "Updated tab labels: Home→$TAB_HOME, Files→$TAB_FILES, Settings→$TAB_SETTINGS"

# ###############################################################################
# # 13. public/templates/data/ footer tab names (inside template data JSONs)
# ###############################################################################
# echo ""
# echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
# echo "📦 13/13  public/templates/data/ (footer tab names)"
# echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
# python3 - "$DATA_JSON" "$PROJECT_ROOT" <<'PYEOF'
# import json, sys, os
# 
# data_json = sys.argv[1]
# project_root = sys.argv[2]
# 
# with open(data_json) as f:
#     data = json.load(f)
# 
# footer1 = data["templates"]["footerTabNames"]["tab1"]
# footer2 = data["templates"]["footerTabNames"]["tab2"]
# 
# for tpl_file in ["mobile.json", "tablet.json"]:
#     path = os.path.join(project_root, "public/templates/data", tpl_file)
#     if not os.path.exists(path):
#         continue
#     with open(path) as f:
#         tpl = json.load(f)
#     if "footers" in tpl:
#         for footer in tpl["footers"]:
#             if footer["index"] == 1:
#                 footer["name"] = footer1
#             elif footer["index"] == 2:
#                 footer["name"] = footer2
#     with open(path, 'w') as f:
#         json.dump(tpl, f, indent=2)
#         f.write('\n')
# PYEOF
# step "Updated footer tab names in template data JSONs"


###############################################################################
# 14. src/components/InvoicePage/Menu/Menu.tsx + PDF export services
###############################################################################
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 14/14  Menu.tsx + export services + InvoiceForm.tsx"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 14a. Menu.tsx
FILE="$PROJECT_ROOT/src/components/InvoicePage/Menu/Menu.tsx"
python3 - "$FILE" "$DATA_JSON" <<'PYEOF'
import re, sys, json

f = sys.argv[1]
data_json = sys.argv[2]
txt = open(f).read()

with open(data_json) as jf:
    data = json.load(jf)

menu = data["menu"]
pdf = data["pdf"]
app_name = data["app"]["name"]

# const APP_NAME
txt = re.sub(r'(const APP_NAME = ")[^"]*(")', r'\g<1>' + app_name + r'\2', txt)

# Print window title
txt = re.sub(r'(window\.open\("", ")[^"]*("\))', r'\g<1>' + menu["printWindowTitle"] + r'\2', txt)

# Share subject (email)
txt = re.sub(r'(subject: ")[^"]*Rent Receipt[^"]*(")', r'\g<1>' + menu["emailSubject"] + r'\2', txt)

# PDF share text
txt = re.sub(r'(text: ")[^"]*PDF generated successfully[^"]*(")', r'\g<1>' + pdf["shareText"] + r'\2', txt)

# CSV share text
txt = re.sub(r'(text: ")[^"]*data exported as CSV[^"]*(")', r'\g<1>' + pdf["csvShareText"] + r'\2', txt)

# Fallback filename references: name: selectedFile || "Rent Receipt"
txt = re.sub(r'(selectedFile \|\| ")[^"]*(")', r'\g<1>' + menu["fallbackFileName"] + r'\2', txt)

# invoiceIdentifier fallback
txt = re.sub(r'(invoiceId \|\| selectedFile \|\| ")[^"]*(")', r'\g<1>' + menu["fallbackFileName"] + r'\2', txt)

# Email / Share body text
email_body = menu.get("emailBody", f"Please find the attached {app_name.lower()} with ID: ")
txt = re.sub(r'(text:\s*`)[^`]*(\$\{invoiceIdentifier\}`)', r'\g<1>' + email_body + r'\g<2>', txt)
txt = re.sub(r'(body:\s*`)[^`]*(\$\{invoiceIdentifier\}`)', r'\g<1>' + email_body + r'\g<2>', txt)

# Toast messages / dialog title labels containing legacy 'rent receipt' or 'ledger'
txt = re.sub(r'(setToastMessage\("Preparing\s+)[^"]*(\s+for email\.\.\."\);)', r'\g<1>' + app_name.lower() + r'\g<2>', txt)
txt = re.sub(r'(dialogTitle:\s*")Share\s+[^"]*(\s+via Email")', r'\g<1>Share ' + app_name + r'\2', txt)
txt = re.sub(r'(setToastMessage\("Failed to share\s+)[^.]*(\.\s+Please try again\."\);)', r'\g<1>' + app_name.lower() + r'\g<2>', txt)
txt = re.sub(r'(setToastMessage\("Failed to prepare\s+)[^ ]*(\s+for email\."\);)', r'\g<1>' + app_name.lower() + r'\g<2>', txt)

open(f, 'w').write(txt)
PYEOF
step "Updated Menu.tsx: APP_NAME, print title, email subject, share texts"

# 14b. exportAsPdf.ts
FILE="$PROJECT_ROOT/src/services/exportAsPdf.ts"
python3 - "$FILE" "$DATA_JSON" <<'PYEOF'
import re, sys, json

f = sys.argv[1]
data_json = sys.argv[2]
txt = open(f).read()

with open(data_json) as jf:
    data = json.load(jf)

pdf = data["pdf"]

# Footer label
txt = re.sub(r'(pdf\.text\(")[^"]*(",\s*10,\s*pageHeight\s*-\s*5)', r'\g<1>' + pdf["footerLabel"] + r'\2', txt)

# Default filename
txt = re.sub(r'(filename = ")[^"]*(")', r'\g<1>' + pdf["defaultFilename"] + r'\2', txt)

open(f, 'w').write(txt)
PYEOF
step "Updated exportAsPdf.ts: footer label, default filename"

# 14c. exportAllSheetsAsPdf.ts
FILE="$PROJECT_ROOT/src/services/exportAllSheetsAsPdf.ts"
python3 - "$FILE" "$DATA_JSON" <<'PYEOF'
import re, sys, json

f = sys.argv[1]
data_json = sys.argv[2]
txt = open(f).read()

with open(data_json) as jf:
    data = json.load(jf)

pdf = data["pdf"]

# Footer label
txt = re.sub(r'(pdf\.text\(")[^"]*(",\s*10,\s*pageHeight\s*-\s*5)', r'\g<1>' + pdf["footerLabel"] + r'\2', txt)

# Default all-sheets filename
txt = re.sub(r'(filename = ")[^"]*(")', r'\g<1>' + pdf["defaultAllSheetsFilename"] + r'\2', txt)

# Single sheet name
txt = re.sub(r'(name: ")[^"]*(",\s*\n\s*htmlContent:)', r'\g<1>' + pdf["singleSheetName"] + r'\2', txt)

open(f, 'w').write(txt)
PYEOF
step "Updated exportAllSheetsAsPdf.ts: footer, filename, sheet name"

# 14d. InvoiceForm.tsx toast message
FILE="$PROJECT_ROOT/src/components/InvoiceForm.tsx"
if [[ -f "$FILE" ]]; then
  python3 - "$FILE" "$DATA_JSON" <<'PYEOF'
import re, sys, json

f = sys.argv[1]
data_json = sys.argv[2]
txt = open(f).read()

with open(data_json) as jf:
    data = json.load(jf)

toast_msg = data["menu"]["saveToastMessage"]
txt = re.sub(r'(showToastMessage\(")[^"]*data saved[^"]*(")', r'\g<1>' + toast_msg + r'\2', txt)
open(f, 'w').write(txt)
PYEOF
  step "Updated InvoiceForm.tsx: save toast message"
fi

###############################################################################
# 15. ios/App/App/Info.plist
###############################################################################
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 15/15  ios/App/App/Info.plist"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FILE="$PROJECT_ROOT/ios/App/App/Info.plist"
if [[ -f "$FILE" ]]; then
  python3 - "$FILE" "$DATA_JSON" <<'PYEOF'
import re, sys, json

f = sys.argv[1]
data_json = sys.argv[2]
txt = open(f).read()

with open(data_json) as jf:
    data = json.load(jf)

ios = data["ios"]

# CFBundleDisplayName
txt = re.sub(
    r'(<key>CFBundleDisplayName</key>\s*\n\s*<string>)[^<]*(</string>)',
    r'\g<1>' + ios["displayName"] + r'\2',
    txt
)

# NSCameraUsageDescription
txt = re.sub(
    r'(<key>NSCameraUsageDescription</key>\s*\n\s*<string>)[^<]*(</string>)',
    r'\g<1>' + ios["cameraUsageDescription"] + r'\2',
    txt
)

# NSPhotoLibraryUsageDescription
txt = re.sub(
    r'(<key>NSPhotoLibraryUsageDescription</key>\s*\n\s*<string>)[^<]*(</string>)',
    r'\g<1>' + ios["photoLibraryUsageDescription"] + r'\2',
    txt
)

# NSMicrophoneUsageDescription
txt = re.sub(
    r'(<key>NSMicrophoneUsageDescription</key>\s*\n\s*<string>)[^<]*(</string>)',
    r'\g<1>' + ios["microphoneUsageDescription"] + r'\2',
    txt
)

open(f, 'w').write(txt)
PYEOF
  step "Updated Info.plist: display name, privacy descriptions"
fi

###############################################################################
# 16. Xcode project.pbxproj — MARKETING_VERSION + CURRENT_PROJECT_VERSION
###############################################################################
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 16/16  ios/App/App.xcodeproj/project.pbxproj"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FILE="$PROJECT_ROOT/ios/App/App.xcodeproj/project.pbxproj"
if [[ -f "$FILE" ]]; then
  python3 - "$FILE" <<PYEOF
import re, sys
f = sys.argv[1]
txt = open(f).read()
txt = re.sub(r'(MARKETING_VERSION = )[^;]*(;)', r'\g<1>$APP_MKT_VER\2', txt)
txt = re.sub(r'(CURRENT_PROJECT_VERSION = )[^;]*(;)', r'\g<1>$APP_BUILD\2', txt)
txt = re.sub(r'(PRODUCT_BUNDLE_IDENTIFIER = )[^;]*(;)', r'\g<1>$APP_PKG\2', txt)
open(f, 'w').write(txt)
PYEOF
  step "Updated MARKETING_VERSION → $APP_MKT_VER, BUILD → $APP_BUILD, BUNDLE ID → $APP_PKG"
fi

###############################################################################
# 17. Icon update (optional — only if sourceIconPath is provided)
###############################################################################
echo ""
if [[ -n "$ICON_SRC" && -f "$ICON_SRC" ]]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎨  Icon Update (from $ICON_SRC)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  IOS_ICON="$PROJECT_ROOT/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"

  # 1. iOS App Icon — 1024x1024, no alpha
  echo "  → Generating iOS icon (1024×1024, no alpha)…"
  sips -z 1024 1024 "$ICON_SRC" --out /tmp/_app_icon_temp.png >/dev/null 2>&1
  # Strip alpha channel using python3 + sips
  python3 -c "
from subprocess import run
# sips can't strip alpha directly; use python to convert RGBA→RGB
try:
    from PIL import Image
    img = Image.open('/tmp/_app_icon_temp.png').convert('RGB')
    img.save('$IOS_ICON')
except ImportError:
    # No PIL — just copy the resized file
    import shutil
    shutil.copy('/tmp/_app_icon_temp.png', '$IOS_ICON')
"
  step "Copied & resized icon → $IOS_ICON"

  # 2. PWA / Web icons
  SIZES=(64 180 192 512)
  NAMES=("pwa-64x64.png" "apple-touch-icon-180x180.png" "pwa-192x192.png" "pwa-512x512.png")
  for i in "${!SIZES[@]}"; do
    sz=${SIZES[$i]}
    nm=${NAMES[$i]}
    sips -z "$sz" "$sz" "$ICON_SRC" --out "$PROJECT_ROOT/public/$nm" >/dev/null 2>&1
    step "Generated public/$nm (${sz}×${sz})"
  done

  # Favicon
  sips -z 48 48 "$ICON_SRC" --out "$PROJECT_ROOT/public/favicon.png" >/dev/null 2>&1
  step "Generated public/favicon.png (48×48)"

  rm -f /tmp/_app_icon_temp.png
else
  echo "⏭️   Icon update skipped (no sourceIconPath or file not found)"
fi

###############################################################################
# 18. Template JSON replacement (optional)
###############################################################################
echo ""
if [[ -n "$TPL_MOBILE_MSC" && -f "$TPL_MOBILE_MSC" ]]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📄  Template: Mobile (public/templates/data/mobile.json)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  cp "$TPL_MOBILE_MSC" "$PROJECT_ROOT/public/templates/data/mobile.json"
  step "Replaced mobile.json from $TPL_MOBILE_MSC"
else
  echo "⏭️   Mobile template update skipped (no mscJsonPath)"
fi

if [[ -n "$TPL_TABLET_MSC" && -f "$TPL_TABLET_MSC" ]]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📄  Template: Tablet/Desktop (public/templates/data/tablet.json)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  cp "$TPL_TABLET_MSC" "$PROJECT_ROOT/public/templates/data/tablet.json"
  step "Replaced tablet.json from $TPL_TABLET_MSC"
else
  echo "⏭️   Tablet template update skipped (no mscJsonPath)"
fi

###############################################################################
# Summary
###############################################################################
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅  App Update Complete — $CHANGE_COUNT changes applied               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋  Summary of updated files:"
echo "    • capacitor.config.ts       (appId, appName, backgroundColor)"
echo "    • package.json              (name, version, description)"
echo "    • ionic.config.json         (name)"
echo "    • index.html                (title, apple-mobile-web-app-title)"
echo "    • public/manifest.json      (short_name, name, theme_color, background_color)"
echo "    • public/templates/meta/    (mobile-meta.json, tablet-meta.json)"
echo "    • public/templates/data/    (footer tab names in mobile.json, tablet.json)"
echo "    • src/theme/variables.css   (primary + secondary color tokens)"
echo "    • src/pages/OnboardingPage.tsx  (title, subtitle, features, CTA)"
echo "    • src/pages/SettingsPage.tsx    (app name, version, descriptions)"
echo "    • src/pages/FilesPage.tsx       (header title)"
echo "    • src/components/DashboardLayout.tsx  (header title)"
echo "    • src/App.tsx                   (tab labels)"
echo "    • src/components/InvoicePage/Menu/Menu.tsx (APP_NAME, subjects, toasts)"
echo "    • src/services/exportAsPdf.ts   (footer, filename)"
echo "    • src/services/exportAllSheetsAsPdf.ts (footer, filenames)"
echo "    • src/components/InvoiceForm.tsx (save toast)"
echo "    • ios/App/App/Info.plist        (display name, privacy descriptions)"
echo "    • ios/App/App.xcodeproj/project.pbxproj  (versions)"
echo ""
echo "🔍  Next steps:"
echo "    1. Review the changes:  git diff"
echo "    2. Test locally:        npm run dev"
echo "    3. Build for prod:      ionic build"
echo "    4. Sync native:         npx cap sync"
echo ""
