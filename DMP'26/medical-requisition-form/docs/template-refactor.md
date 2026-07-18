# Template Architecture Refactor — Changelog

## Date: 2025-06-14

### Summary

Migrated SocialCalc template loading from **build-time JSON imports** to **runtime fetch()** from `public/templates/`. Removed dead files and centralized all template data + metadata in `public/templates/`.

### What Changed

#### New Template File Structure

```
public/templates/
├── data/
│   ├── mobile.json    ← Full template (msc + appMapping + footers) for mobile
│   └── tablet.json    ← Full template for tablet/desktop
└── meta/
    ├── mobile-meta.json   ← Template metadata (name, description, hashtags, etc.)
    └── tablet-meta.json   ← Template metadata for tablet
```

#### Refactored: `src/services/local-template-service.ts`

**Before:**
- Imported `sheetdata.json` / `sheetdata1.json` at build time (Vite JSON import)
- Metadata was hardcoded inline in `fetchStoreTemplates()` and `fetchStoreTemplate()`
- `fetchTemplateMeta()` and `fetchTemplateData()` existed but were dead code

**After:**
- Uses `fetch()` at runtime to load templates from `/templates/data/` and `/templates/meta/`
- `TEMPLATE_FILE_MAP` maps template IDs (100001/100002/100003) to filenames (mobile/tablet)
- `fetchTemplateMeta()` and `fetchTemplateData()` are now the actual data source
- No more build-time imports — templates are fully swappable without rebuilding

#### Deleted Files (Dead Code)

| File | Reason |
|------|--------|
| `sheetdata.json` (root) | Replaced by `public/templates/data/tablet.json` |
| `sheetdata1.json` (root) | Replaced by `public/templates/data/mobile.json` |
| `src/app-data.ts` | Dead stub — `APP_NAME` and `DATA` were never used |
| `public/templates/data/100001.json` | Renamed to `mobile.json` (with corrected MSC data) |
| `public/templates/data/100002.json` | Renamed to `tablet.json` |
| `public/templates/data/100003.json` | Removed (desktop uses tablet data) |
| `public/templates/meta/100001-meta.json` | Renamed to `mobile-meta.json` |
| `public/templates/meta/100002-meta.json` | Renamed to `tablet-meta.json` |
| `public/templates/meta/100003-meta.json` | Removed (desktop derives from tablet meta) |

#### Updated: Automation Script (`scripts/app-update-automation/`)

- Step 6 now generates `mobile-meta.json` and `tablet-meta.json` from `data.json`
- Step 13 now updates footer tab names directly in template data JSONs
- Step 18 copies template files to `public/templates/data/` (was `sheetdata*.json`)
- Removed the old `app-data.ts` update step

### Impact

- **Bundle size reduced** — templates no longer bundled into the JS output
- **Templates are hot-swappable** — change JSON in `public/templates/` without rebuilding
- **Single source of truth** — template data + metadata in one directory
- **Automation script** fully updated and tested (23 changes, 0 errors)
