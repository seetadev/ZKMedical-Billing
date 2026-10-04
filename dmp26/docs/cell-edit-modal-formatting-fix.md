# Cell Edit Modal Formatting & Border Preservation Fix

## Problem Description
When editing cells through `CellEditModal` (e.g. updating invoice items, customer details, or amounts), cell borders and text colors were inadvertently stripped or corrupted. Specifically:
1. **Disrupted Borders**: `borderPlacement` state defaulted to `'none'`. In `handleApply`, if `borderPlacement === 'none'`, the modal unconditionally constructed a border removal payload (`{ top: '', bottom: '', left: '', right: '' }`) and passed it to `AppGeneral.updateCellValueAndFormat`. This caused SocialCalc to execute `set coord bt `, `set coord bb `, `set coord bl `, `set coord br ` on every edit, wiping out all borders on that cell.
2. **Corrupted Colors**: `formatting.fontColor` and `formatting.bgColor` fell back to truthy objects (`{ name: 'Default', color: null, value: null }`), causing `updateCellValueAndFormat` to issue `set coord color [object Object]` and `set coord bgcolor [object Object]`.
3. **No Dirty State Tracking**: The modal lacked tracking to distinguish between properties that were intentionally modified by the user versus those that should remain untouched.
4. **Incorrect Initial State**: Existing borders from the cell were not loaded into the modal's border controls upon opening.

## Solution Implemented

### 1. `CellEditModal.tsx`
- **Dirty State Tracking**:
  - Introduced `isFontColorChanged`, `isBgColorChanged`, and `isBorderChanged` flags (initialized to `false` when modal opens).
  - Only when the user explicitly interacts with color swatches or border controls do these flags become `true`.
- **Accurate Border & Color Inspection**:
  - When opening, reads existing cell borders via `AppGeneral.getCellFormatting(coord)`.
  - Parses existing border style, width, and color via `/(\S+)\s+(\S+)\s+(\S.+)/` to initialize controls without marking them as dirty.
  - Resolves font and background colors against palette or displays current cell color.
- **Selective Formatting Payload**:
  - In `handleApply`, `formatting.borders` is only populated if `isBorderChanged === true`.
  - `formatting.fontColor` is only populated if `isFontColorChanged === true`.
  - `formatting.bgColor` is only populated if `isBgColorChanged === true`.
  - When editing text only, `formatting` is empty `{}` and no format/border commands are generated, preserving all existing cell borders and attributes.

### 2. `formatting.js` (`updateCellValueAndFormat`)
- **Strict Key Checking**: Only generates formatting commands for keys explicitly defined on `formatting`.
- **Object Defense**: Extracts string values if an object is passed (`typeof formatting.fontColor === 'object' ? formatting.fontColor.value : ...`), preventing `[object Object]` from ever being emitted.
- **Value Cleaning**: Empty inputs cleanly emit `set coord empty`; formulas starting with `=` cleanly emit `set coord formula <formula>`.

### 3. Automated Test Suite
- Added `CellEditModal.test.ts` with 8 test cases verifying:
  - Text-only edits emit only text/value commands without border or color commands.
  - Border commands are only emitted when explicitly requested.
  - Color commands are only emitted when explicitly requested.
  - Never emits `[object Object]`.
