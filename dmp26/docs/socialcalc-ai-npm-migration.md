# SocialCalc Standalone npm Package Migration (`socialcalc-ai`)

## Overview
Previously, the project maintained a local legacy fork of the SocialCalc spreadsheet engine inside `src/components/InvoicePage/socialcalc`.
This architecture required shipping and maintaining dozens of legacy JavaScript/TypeScript files directly inside the app repository.

The spreadsheet engine, plugin system, and touch-optimized UI components were extracted and published as a standalone, zero-dependency package on npm: **`socialcalc-ai`** (version `1.0.1`).

## Key Migration Details

### 1. Package Installation
- Added `socialcalc-ai@1.0.1` as a primary dependency in `package.json`.

### 2. TypeScript Declarations (`src/types/socialcalc-ai.d.ts`)
Created comprehensive TypeScript ambient type definitions for:
- Core `SocialCalc` engine namespace, controls, formatting, and commands.
- Plug-ins (`enableEditableCellsOnly`, `disableEditableCellsOnly`, `isCellEditable`, `generateEditableCells`, `registerPlugin`, etc.).
- UI components: `CellEditModal`, `EditableCellsModal`, `RowActionPopover`, `DemoVideosModal`, `HorizontalScrollBar`.
- Constants and utilities: `FONT_COLORS`, `BG_COLORS`, `FORMULA_GUIDES`, `compressImage`.

### 3. Consumer Refactoring in `src/`
All import statements pointing to `.../socialcalc` were rewritten to import from `"socialcalc-ai"`:
- `src/components/InvoicePage/CellEditModal/CellEditModal.tsx`
- `src/components/InvoicePage/FileMenu/FileOptions.tsx`
- `src/components/InvoicePage/Menu/Menu.tsx`
- `src/components/Files/Files.tsx`
- `src/pages/SettingsPage.tsx`
- `src/components/InvoiceForm.tsx`
- `src/pages/InvoicePage.tsx`
- `src/pages/InvoicePluginPlayground.tsx`

### 4. Vitest Configuration (`vitest.config.ts`)
Configured Vitest to inline and transform JSX/TSX inside the published package:
```typescript
test: {
  server: {
    deps: {
      inline: [/socialcalc-ai/],
    },
  },
}
```

### 5. Unit Test Suites Migrated to `src/test/`
Converted and verified unit tests against `socialcalc-ai`:
- `src/test/socialcalc-cell-edit.test.ts` (10 tests)
- `src/test/socialcalc-editable-cells.test.ts` (10 tests)
- `src/test/socialcalc-editable-cells-modal.test.ts` (2 tests)

### 7. Upgrades & Version History
- **v1.0.1**: Initial extraction and migration of the standalone SocialCalc package.
- **v1.0.2**: Updated package dependencies, bundled complete TypeScript definitions in `index.d.ts`, and updated consumer app to `socialcalc-ai@1.0.2`. All 54 unit tests passing.

