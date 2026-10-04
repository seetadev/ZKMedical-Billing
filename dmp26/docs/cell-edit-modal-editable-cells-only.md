# Cell Edit Modal - Editable Cells Only Plugin & Setting

## Overview
Added a configurable setting and SocialCalc plugin (`editableCellsOnly`) allowing users to restrict the Cell Edit Modal to trigger only on cells marked as editable in the invoice template. When disabled, the edit modal triggers on all cells. For the Customize Invoice editor / Playground, the modal always triggers on all cells regardless of the setting.

## Key Changes

### 1. SocialCalc Plugin: `editable-cells.js`
- **Location**: `src/components/InvoicePage/socialcalc/modules/editable-cells.js`
- **Functions**:
  - `enableEditableCellsOnly()`: Restricts cell edit modal to allowed cells.
  - `disableEditableCellsOnly()`: Allows edit modal on all cells.
  - `isEditableCellsOnlyEnabled()`: Returns current boolean state.
  - `toggleEditableCellsOnly(show?)`: Toggles plugin state.
  - `isCellEditable(editor, coord)`: Evaluates if a given cell coord is allowed by checking `SocialCalc.EditableCells` allowlist (`sheet!coord`) or falling back to `SocialCalc.Callbacks.IsCellEditable(editor)`.
- **Registration**: Registered with `registerPlugin("editableCellsOnly", ...)` and exported from `src/components/InvoicePage/socialcalc/index.js`.

### 2. Mouse Intercept: `listeners.js`
- **Location**: `src/components/InvoicePage/socialcalc/modules/listeners.js`
- When `_cellEditModalEnabled` is active:
  - Checks if `isEditableCellsOnlyEnabled()` is true.
  - If enabled and `!isCellEditable(editor, coord)`: moves cell selection / focus, but does **not** trigger `CellEditModal` (matching native behavior when modal is off).
  - Otherwise: triggers `CellEditModal`.

### 3. App Settings: `settings.ts`
- **Location**: `src/utils/settings.ts`
- Added `cellEditOnlyAllowed: boolean` property to `AppSettings` (defaulting to `true`).
- Added `getCellEditOnlyAllowed()` and `setCellEditOnlyAllowed(enabled: boolean)`.

### 4. Settings UI: `SettingsPage.tsx`
- **Location**: `src/pages/SettingsPage.tsx`
- Added an `IonToggle` row under **General Settings**: "Edit Modal on Allowed Cells Only" (with sublabel: "Only open the edit modal for editable cells in invoices").
- Uses native `@ionic/react` component `IonToggle` per project guidelines.
- Toggling immediately updates local settings and calls `enableEditableCellsOnly()` / `disableEditableCellsOnly()` with feedback toast.

### 5. Invoice Page Integration: `InvoicePage.tsx`
- **Location**: `src/pages/InvoicePage.tsx`
- Synchronizes `editableCellsOnly` plugin state on mount and route change using `getCellEditOnlyAllowed()`.

### 6. Customize Page Behavior: `InvoicePluginPlayground.tsx`
- **Location**: `src/pages/InvoicePluginPlayground.tsx`
- On mount and initialization, calls `disableEditableCellsOnly()` so the modal triggers on all cells for customizing templates.
- On unmount, restores the user's setting via `getCellEditOnlyAllowed()`.

### 7. Unit Tests
- **Location**: `src/components/InvoicePage/socialcalc/modules/editable-cells.test.ts`
- 10 test cases covering:
  - Enabling, disabling, and toggling plugin state.
  - Permission checks with `EditableCells.allow = false` (all cells allowed).
  - Permission checks with `EditableCells.allow = true` (only allowlisted cells return true).
  - Multi-sheet coord resolution (`sheet1!A1`, `sheet2!B5`).
  - Fallback to `SocialCalc.Callbacks.IsCellEditable`.
