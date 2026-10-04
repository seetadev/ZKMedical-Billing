# PDF Export, Export All & Native Printing Documentation

## Overview
This document describes the implementation ported from `Base-pdf-fix` into the Invoice application to fix and modernize single-sheet PDF export, multi-sheet PDF export pipelines, and native iOS/Android sheet printing using Capacitor.

## Summary of Changes

### 1. `src/services/exportAsPdf.ts` (Single-sheet PDF Export)
- **Live Canvas Synchronization (`syncCanvases`)**:
  - Automatically identifies all `<canvas>` elements rendered in `#tableeditor` (e.g., JFlot charts) and copies pixel data to the clone container before `html2canvas` renders it, ensuring charts are no longer missing or blank in PDFs.
- **Row-Aware Page Splitting**:
  - Replaced naive pixel height slicing (which cut through table rows mid-row) with dynamic row boundary detection.
  - Slices are computed based on table row (`<tr>`) bounding boxes so table rows never split across page boundaries.
- **Accurate Page Numbering & Footers**:
  - Computes slices first to determine exact total page count before drawing headers and footers (`Page X of Y`).
  - Retained clean application footer branding: `Invoice` at bottom left and ISO date/time at top left.

### 2. `src/services/exportAllSheetsAsPdf.ts` (Multi-sheet Combined PDF Export)
- **Blank First Page Elimination**:
  - Eliminated the buggy `pdf.deletePage(1)` logic. Instead, the first sheet's first slice renders directly onto page 1 of the newly initialized jsPDF document, and `pdf.addPage()` is only called for continuation slices or subsequent sheets.
- **Conditional Canvas Sync**:
  - Synchronizes screen canvases via `syncCanvases` when processing the currently active sheet.
- **Row-Aware Page Splitting Across All Sheets**:
  - Applied the identical row-boundary splitting algorithm to each sheet in the workbook.
- **Branding & Naming**:
  - Preserved `Invoice` footer branding, default filename `all_invoices.pdf`, and sheet name `Invoice`.

### 3. `src/services/exportAllAsPdf.ts` (Compatibility Re-exports)
- Re-exports `exportAllSheetsAsPDF`, `exportSingleSheetAsPDF`, `exportHTMLAsPDF`, and related types from `exportAllSheetsAsPdf.ts` and `exportAsPdf.ts`, guaranteeing backwards compatibility for any import paths.

### 4. `src/components/InvoicePage/Menu/Menu.tsx` (UI Wiring & Native Printing)
- **Native iOS & Android Printing (`doPrint`)**:
  - Enabled `@bcyesil/capacitor-plugin-printer` for iOS (AirPrint) and Android native print services.
  - High-fidelity pipeline: Generates the row-aware vector/canvas PDF blob and sends `base64:data:application/pdf;base64,...` to the native iOS print controller (`UIPrintInteractionController`), presenting the native iOS AirPrint sheet with full print preview, page range, and printer discovery.
  - Direct HTML fallback: If PDF generation encounters an issue, automatically falls back to native HTML printing.
  - Desktop fallback: Uses standard `window.print()` when running in a desktop browser.
- **Enabled "Print" Button in Action Sheet**:
  - Added `{ text: "Print", icon: print, handler: () => doPrint() }` into `getMenuButtons()`.
- **Removed 3-Sheet Limit**:
  - Removed obsolete debug guard `if (sheetsData.length > 3) return;` which silently blocked export for workbooks with more than 3 sheets.
- **Added "Export All as PDF" Action Sheet Option**:
  - Added `{ text: "Export All as PDF", icon: documents, handler: ... }` to `getMenuButtons()` so users can trigger workbook-level PDF export directly from the menu.
- **Enhanced Error Feedback**:
  - Surfaced `error?.message || error` in user-facing toasts and console logs instead of generic swallowed errors.
