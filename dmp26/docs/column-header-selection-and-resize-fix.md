# Column Header Selection & Resize Fix for Narrow Columns

## 1. Problem Description
When selecting a narrow column (such as column **G**, with width ~20px), users were unable to select the column. Instead, clicking the header either triggered column resizing for the adjacent column (F) or the current column (G), or failed entirely without highlighting column G and showing the corner resize handle.

## 2. Root Cause Analysis
1. **Edge-detection zone overlap**:
   Previously, in `SocialCalc.ProcessEditorMouseDown`, edge proximity was checked with a 10px tolerance:
   `Math.abs(clientX - colRight) <= 10` and `Math.abs(clientX - colLeft) <= 10`.
   For narrow columns where column width is <= 25px, the entire cell was swallowed by the left or right resize zones, completely preventing normal column selection.
2. **Column coordinate overshoot**:
   In `SocialCalc.GridMousePosition`, clicking near the right edge of the last column (e.g. column 7 / G) caused `result.col` to evaluate to 8 (column H), which does not exist in a 7-column sheet.
3. **Corner handle positioning**:
   `updateColumnResizeHandlePosition` checked `if (!editor.colpositions[colNum] || !editor.colwidth[colNum])`, which could prematurely hide the resize handle if position was 0 or not yet rendered in the internal array.

## 3. Changes Made
1. **Direct DOM Column Resolution & Clamping** (`src/components/InvoicePage/socialcalc/modules/listeners.js`):
   - Directly checks the clicked DOM element (`headerTd`) to read its column letter (e.g. "G") and resolves the exact column index (`G` -> 7).
   - Clamps `colNum` to the sheet's `lastcol` boundary.
2. **Narrow Column Click Protection** (`listeners.js`):
   - For narrow columns (`colWidth <= 45px`) and touch interactions, header clicks **always** trigger `selectColumn(colNum)` directly without edge-drag resizing hijacking the click.
   - For wider columns (`> 45px`), edge tolerance was tightened from 10px to 4px.
   - If the user clicks on the border without dragging (`!hasMoved`), mouse up falls back to selecting the column.
3. **Pixel-Perfect Corner Handle Positioning** (`src/components/InvoicePage/socialcalc/modules/row-col-headers.js`):
   - Uses `headerCell.getBoundingClientRect()` directly from DOM to accurately place the corner resize handle (`#sc-col-resize-corner-handle`) at `(rect.right, rect.bottom)` with graceful fallback to `colpositions` + `colwidth`.
