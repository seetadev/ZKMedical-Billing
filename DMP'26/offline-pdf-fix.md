
# 🐛 PDF Export Fix — Change Documentation

**🔗 Repository:** [its-me-ani/socicalc-pdf-fix](https://github.com/its-me-ani/socicalc-pdf-fix)  
**Commits covered:** `c7f8b9d` → `f463185` → `3ec6570` → `bf92921`  
**Date range:** Jun 27 – Aug 7, 2026  
**Author:** [@anisharma07](https://github.com/anisharma07)

---

## Overview

This section documents all code changes made to fix the PDF export pipeline. Two main export paths were overhauled:

| Service | Purpose |
|---|---|
| `exportAsPdf.ts` | Single-sheet PDF export (current view) |
| `exportAllSheetsAsPdf.ts` | Multi-sheet combined PDF export |
| `Menu.tsx` | Action sheet UI wiring |

---

## Root Causes (Problems Being Fixed)

### 1. Content Getting Cut Mid-Row
The original multi-page splitting logic used a fixed pixel height to slice the rendered canvas. This meant a row in the spreadsheet table could be **split across two pages**, showing half of a row on one page and the rest on the next.

### 2. Charts / Canvas Elements Missing from PDF
SocialCalc renders charts using `<canvas>` elements painted by JFlot. When the HTML content was cloned into a temporary off-screen `div` (required by `html2canvas`), the canvas elements in the clone were **blank** — `html2canvas` cannot copy painted canvas pixel data by reference.

### 3. Blank First Page in Multi-Sheet Export
The `exportAllSheetsAsPDF` function used jsPDF's default first page and then inserted content starting from a new page via `pdf.addPage()`. This left a completely **blank first page** in the output PDF.

### 4. Sheet Count Hard-Limit (Silently Aborted)
There was a guard `if (sheetsData.length > 3) { return; }` in `Menu.tsx` that silently aborted the export if more than 3 sheets existed. This was a leftover debugging guard that was never removed.

### 5. Swallowed Errors
Both the catch block in the export handler and the `deletePage` call provided no useful feedback. Errors were silently swallowed with only a generic toast.

---

## Changes Per File

### `src/services/exportAsPdf.ts`

#### A. New: `syncCanvases()` helper (commit `3ec6570`)

```typescript
const syncCanvases = (screenEditor: Element, tempContainer: Element) => { ... }
```

**What it does:**  
Before handing the cloned HTML to `html2canvas`, this function iterates every `<canvas>` in the live `#tableeditor` DOM. For each canvas it:
1. Walks up the ancestor chain to find the closest cell with an `id` attribute.
2. Looks up the same cell in the temp container using an attribute selector (`[id="..."]`) to avoid CSS escaping issues.
3. Copies all attributes and `innerHTML` from the live cell to the temp cell.
4. Creates a new canvas of the same dimensions in the temp cell and uses `ctx.drawImage(src, 0, 0)` to copy the pixel data.

This ensures charts rendered by JFlot on screen are faithfully reproduced in the PDF.

**Called from:**
```typescript
const screenEditor = document.getElementById("tableeditor");
if (screenEditor) {
  syncCanvases(screenEditor, tempContainer);
}
```

#### B. Row-Aware Page Splitting (commit `3ec6570`)

**Old approach:** Fixed-height slicing using a running `heightLeft` variable with a reused full-canvas `addImage` call. This caused content to cut through table rows.

**New approach:**
1. After `html2canvas` renders the canvas, the bounding rects of all `<tr>` elements are captured **before** the temp container is removed from the DOM.
2. These are converted to canvas-pixel coordinates using `scale = canvas.width / containerRect.width`.
3. A `while (sourceY < canvas.height)` loop computes each page slice:
   - It looks for a row that **crosses the page boundary** (`r.top < limitY && r.bottom > limitY`).
   - If found, the split point is moved up to `crossedRow.top` — keeping the row whole on the next page.
   - If not found, it falls back to the bottom of the last complete row before the boundary.
4. Each slice is drawn onto a **new temporary canvas** (`sliceCanvas`) via `drawImage`, then added to the PDF as a separate page image.
5. The total page count (`actualTotalPages`) is now known before headers/footers are written, fixing the `Page X of Y` numbering.

```typescript
interface PageSlice {
  canvas: HTMLCanvasElement;
  heightMm: number;
}
const slices: PageSlice[] = [];
// ... build slices loop ...
actualTotalPages = slices.length;
```

---

### `src/services/exportAllSheetsAsPdf.ts`

#### A. Removed Blank First Page (commit `bf92921`)

```diff
- // Remove the first empty page
- pdf.deletePage(1);
```

The original code created a jsPDF document (which auto-creates page 1), then added every sheet's content via `pdf.addPage()`, leaving page 1 empty. The workaround `pdf.deletePage(1)` was fragile.

**Fix:** The loop was restructured so that `pdf.addPage()` is only called **before** pages 2, 3, …, not before the first page. The first sheet is written directly onto the pre-existing page 1.

#### B. `syncCanvases()` Applied Per-Sheet (commit `3ec6570`)

The same `syncCanvases` helper was added here. For multi-sheet exports, canvas sync is conditional — it only runs for the **currently active sheet** visible on screen:

```typescript
const socialCalc = (window as any).SocialCalc;
const activeSheetId = socialCalc?.GetCurrentWorkBookControl?.()?.currentSheetButton?.id;
if (sheet.id === activeSheetId) {
  const screenEditor = document.getElementById("tableeditor");
  if (screenEditor) {
    syncCanvases(screenEditor, tempContainer);
  }
}
```

This avoids trying to copy screen canvas data for sheets that aren't currently rendered.

#### C. Row-Aware Page Splitting (commit `3ec6570`)

Identical row-boundary logic as `exportAsPdf.ts` was applied to the per-sheet rendering loop:
- Capture `<tr>` bounding rects before container removal.
- Compute `pxScale = canvas.width / imgWidth` and `sliceHeightPx = sliceHeightMm * pxScale`.
- Use the same row-boundary-aware while loop to build slices.
- Track `pageInSheet` counter per sheet.

---

### `src/components/InvoicePage/Menu/Menu.tsx`

#### A. Removed 3-Sheet Guard (commit `bf92921`)

```diff
- if (sheetsData.length > 3) {
-   // Error handled
-   return;
- }
```

Removing this limit allows users with 4+ sheets to export all sheets as PDF.

#### B. Better Error Reporting in Catch Block (commit `bf92921`)

```diff
- } catch (error) {
-   // Error handled
-   setToastMessage("Failed to generate combined PDF. Please try again.");
+ } catch (error: any) {
+   console.error("Failed to generate combined PDF:", error);
+   setToastMessage(`Failed to generate combined PDF: ${error?.message || error}`);
```

The error's actual message is now surfaced in both the console and the user-facing toast.

#### C. Added "Export All as PDF" Action Sheet Button (commit `bf92921`)

A new action sheet option was added so users can trigger the multi-sheet PDF export from the UI:

```typescript
{
  text: "Export All as PDF",
  icon: documents,
  handler: () => {
    showExportAllPDFNameDialog();
  },
},
```

---

## Commit Timeline

| Commit | Message | Key Changes |
|---|---|---|
| `c7f8b9d` | code updated | Initial `Menu.tsx`, `exportAsPdf.ts`, `exportAllSheetsAsPdf.ts` scaffolding added to repo |
| `f463185` | changes | App name/copy updates (rebranding pass) |
| `3ec6570` | pdf done | `syncCanvases()` helper, row-aware page splitting, canvas sync for multi-sheet, row boundary capture |
| `bf92921` | pdf done | Removed blank first page (`deletePage`), removed 3-sheet guard, improved error reporting, added "Export All as PDF" button |

---

## Architecture Flow

```
User taps "Export All as PDF"
          │
          ▼
Menu.tsx → showExportAllPDFNameDialog()
          │
          ▼
doExportAllAsPDF(filename)
  │
  ├─ AppGeneral.getAllSheetsData()       ← get all sheets HTML
  │
  └─ exportAllSheetsAsPDF(sheetsData)   [exportAllSheetsAsPdf.ts]
       │
       ├─ for each sheet:
       │    ├─ inject HTML into tempContainer (off-screen div)
       │    ├─ syncCanvases() if sheet is active   ← copy live canvas pixels
       │    ├─ html2canvas(tempContainer)           ← render to canvas
       │    ├─ capture <tr> bounding rects          ← for row-aware splitting
       │    └─ slice canvas into pages
       │         ├─ find rows crossing page boundary
       │         └─ split at row boundary (not mid-row)
       │
       └─ assemble jsPDF
            ├─ write page 1 directly (no addPage before first sheet)
            ├─ addPage() before sheets 2, 3, ...
            └─ addHeaderAndFooter() on all pages
```

---

## Files Changed Summary

| File | Type | Description |
|---|---|---|
| `src/services/exportAsPdf.ts` | Modified | Added `syncCanvases()`, row-aware slicing, accurate page count |
| `src/services/exportAllSheetsAsPdf.ts` | Modified | Same fixes + removed blank first page + conditional canvas sync |
| `src/components/InvoicePage/Menu/Menu.tsx` | Modified | Removed 3-sheet limit, improved error reporting, added "Export All as PDF" button |
