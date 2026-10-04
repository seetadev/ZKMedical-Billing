# Cell Edit Modal Number & Date Formatting Feature

## Overview
Added support for selecting and applying cell value formats directly from the **Cell Edit Modal** (`CellEditModal.tsx`). This allows users to format numbers, currencies, percentages, dates, and times using legacy SocialCalc format rules without cluttering the interface.

## Selected Formats Supported
Only the most frequently used formats and practical variations are included:

| Category | Format Display | Format String | Preview Example |
| :--- | :--- | :--- | :--- |
| **General** | Default | `""` | Automatic |
| **General** | Auto w/ commas | `[,]General` | `1,234.56` |
| **Number** | `1,234.56` | `#,##0.00` | `1,234.56` |
| **Number** | `1,234` | `#,##0` | `1,234` |
| **Number** | `1,234.5` | `#,##0.0` | `1,234.5` |
| **Number** | `1234` | `0` | `1234` |
| **Number** | `(1,234.56)` | `#,##0.00_);(#,##0.00)` | `(1,234.56)` |
| **Currency** | `$1,234.56` | `$#,##0.00` | `$1,234.56` |
| **Currency** | `$1,234` | `$#,##0` | `$1,234` |
| **Currency** | `$1,234.5` | `$#,##0.0` | `$1,234.5` |
| **Currency** | `($1,234.56)` | `$#,##0.00_);($#,##0.00)` | `($1,234.56)` |
| **Percentage** | `1,234%` | `#,##0%` | `12%` |
| **Percentage** | `1,234.5%` | `#,##0.0%` | `12.5%` |
| **Percentage** | `1,234.56%` | `#,##0.00%` | `12.34%` |
| **Date** | `01/04/2006` | `mm/dd/yyyy` | `01/04/2026` |
| **Date** | `1/4/06` | `m/d/yy` | `1/4/26` |
| **Date** | `2006-01-04` | `yyyy-mm-dd` | `2026-01-04` |
| **Date** | `04-Jan-2006` | `dd-mmm-yyyy` | `04-Jan-2026` |
| **Date** | `January 4, 2006` | `mmmm d, yyyy` | `January 4, 2026` |
| **Time** | `1:23 PM` | `h:mm AM/PM` | `1:23 PM` |
| **Time** | `01:23:45` | `hh:mm:ss` | `01:23:45` |
| **Time** | `1:23` | `h:mm` | `1:23` |

## Technical Implementation

### 1. `formatting.js`
- **`getCellFormatting(coord)`**:
  - Resolves `cell.nontextvalueformat` into its string representation using `sheetobj.valueformats[cell.nontextvalueformat - 0]`.
- **`updateCellValueAndFormat(coord, val, formatting)`**:
  - Handles `formatting.valueFormat`:
    - If empty string or `"default"`, emits `set <coord> nontextvalueformat ` to reset format.
    - If valid format string, emits `set <coord> nontextvalueformat <formatString>`.

### 2. `CellEditModal.tsx`
- **Category Filter Pills**: Quick filter tabs for `All`, `Number`, `Currency`, `Percent`, `Date`, and `Time`.
- **Grid of Format Cards**: Clean cards showing format label and formatted sample preview.
- **Dirty State Tracking**: Uses `isValueFormatChanged`. Does not emit format commands if the user did not touch the format.
- **Current Format Detection**: Pre-selects the cell's active format on open.

### 3. Verification & Tests
- Automated unit test suite updated in `CellEditModal.test.ts` (10 passing tests).
- Clean compilation in TypeScript and Vite (`npm run build`).
- iOS platform synchronized (`npx cap copy ios`).
