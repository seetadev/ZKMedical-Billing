# Storage Size Checker & Accurate Document Size Tracking

## Problem Description
In the Files list and Dashboard storage checker, invoice documents containing embedded company logos and high-resolution assets were showing inaccurate, tiny file sizes (e.g., `0.46 KB`, `0.47 KB`) instead of their real size (which ranges from several hundred KBs up to multiple MBs).

### Root Cause Analysis
1. **Lightweight Index vs Full Document**:
   The storage engine (`invoice-repository.ts`) employs a two-tier storage architecture:
   - **Full Document Key (`inv_doc_${id}`)**: Holds the complete spreadsheet JSON, cell contents, and embedded base64 assets (logos/signatures).
   - **Lightweight Index (`invoices_index`)**: Stores list metadata (`id`, `name`, `total`, dates, etc.) to ensure instant list rendering.
2. **Empty Content Pointer**:
   `getAllInvoices()` deliberately returns `content: ''` in its list projection to prevent loading tens of megabytes into memory.
3. **Fallback to In-Memory Object**:
   In `Files.tsx`, `calculateFileSize(file)` checked:
   ```typescript
   let raw = file.content;
   if (!raw) {
     raw = JSON.stringify(file); // FALLBACK BUG
   }
   const bytes = new Blob([raw]).size;
   ```
   Because `file.content` was `""`, `!raw` evaluated to `true`, causing it to stringify the tiny JavaScript UI object in memory (`{ key, name, date, invoiceId, content: "", total, ... }`). This resulted in measuring only ~470 bytes (`0.46 KB` - `0.47 KB`).
4. **Formatter Limitation**:
   The calculation only formatted values using `/ 1024` with the suffix `KB`, never transitioning to `MB`.
5. **Dashboard Storage Accumulator**:
   In `DashboardHome.tsx`, `allFiles.forEach` measured `new Blob([f.content]).size`, which evaluated to 0 bytes because `f.content` was `""`.

---

## Changes Made

### 1. Type Definitions (`src/data/types.ts` & `src/services/local-template-service.ts`)
- Added optional `sizeInBytes?: number` property to `SavedInvoice` and `InvoiceIndexItem`.

### 2. Storage Repository (`src/data/repositories/invoice-repository.ts`)
- **Index Definition**: Added `sizeInBytes?: number` to `InvoiceIndexItem`.
- **Accurate Size Calculation on Save**:
  In `createInvoice` and `updateInvoice`:
  ```typescript
  const serialized = JSON.stringify(fullInvoice);
  const sizeInBytes = new Blob([serialized]).size;
  fullInvoice.sizeInBytes = sizeInBytes;
  // stored on both the full document and in the index item
  ```
- **Automatic Transparent Backfill**:
  In `getAllInvoices()`, for any existing invoice that does not yet have `sizeInBytes` recorded in the index:
  - Fetches the document from Preferences (`Preferences.get({ key: item.docKey })`).
  - Measures `new Blob([rawDoc]).size` and saves it into `item.sizeInBytes`.
  - Persists the updated `invoices_index` back to Preferences so subsequent loads remain zero-overhead.

### 3. Local Template Service (`src/services/local-template-service.ts`)
- Updated `getSavedInvoices()`, `getInvoice()`, and `saveInvoice()` to preserve and forward `sizeInBytes`.

### 4. Files List View (`src/components/Files/Files.tsx`)
- Updated `calculateFileSize(file)`:
  - Prioritizes `file.sizeInBytes`.
  - Falls back to `file.content` or `JSON.stringify(file)` if missing.
  - Dynamically formats as `X.XX MB` if size $\ge 1\text{ MB}$, otherwise `X.XX KB`.
- Forwarded `sizeInBytes` in the local and cloud invoice file mappers.

### 5. Dashboard Home (`src/pages/DashboardHome.tsx`)
- Updated `totalBytes` calculation in `loadData()` to use `f.sizeInBytes` when present, ensuring accurate total storage metrics across all invoices.

---

## Verification & Testing
- **Unit Tests Added** in `src/data/repositories/invoice-repository.test.ts`:
  - Validates `sizeInBytes` calculation and persistence for documents with large base64 logo data.
  - Validates automatic backfilling of `sizeInBytes` for legacy/unindexed items during `getAllInvoices()`.
- **Test Suite Results**:
  All 27 vitest test cases passed cleanly (`5/5 test files passed`).
- **Production Build**:
  TypeScript compilation (`tsc`) and Vite production bundle passed with code `0`.
