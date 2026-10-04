# High-Capacity Offline Storage Architecture (Capacitor Preferences + Metadata Index)

## 📌 Executive Summary
Invoice MVP uses an offline-first spreadsheet calculation engine powered by SocialCalc. Prior to this design, all saved invoices (including full serialized MultiSheet Calc MSC spreadsheet payloads) were stored in a single JSON array inside browser `localStorage` under `ls_invoices`.

Because browser and WebView `localStorage` has a strict hard quota of **5 MB to 10 MB per origin**, storing multiple complete spreadsheets (at 100 KB–500 KB per file) in a single key caused `QuotaExceededError` crashes, forcing an artificial limit of 15 files.

This document describes the modern **Tiered Preferences Storage + Metadata Index** architecture, which removes the 15-file ceiling, ensures **100% backward compatibility** with legacy `localStorage` data without data loss, and enables seamless offline storage of thousands of invoices.

---

## 🏗 Storage Tier Overview

```
                          Invoice MVP Storage Architecture
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
Tier 1: Document Storage         Tier 2: Metadata Index           Tier 3: App Preferences
  (@capacitor/preferences)         (invoices_index)                 (@capacitor/preferences)
        │                                │                                │
  Standalone records per doc       Lightweight index list           Small settings & flags
  Key: `inv_doc_${id}`             Cached for instantaneous         (< 1 KB total)
  (Multi-MB device storage)        table listing & search           (Theme, Currency, Active ID)
```

| Dimension | Tier 1: Document Records | Tier 2: Metadata Index | Tier 3: App Preferences |
|---|---|---|---|
| **Storage Engine** | `@capacitor/preferences` (`inv_doc_${id}`) | `invoices_index` in Preferences | `@capacitor/preferences` / `localStorage` |
| **Contents** | Full SocialCalc MSC spreadsheet payload, cell formulas, formatting, footers | File ID, name, templateId, billType, total, timestamps, details | Theme ("ocean-blue"), default currency ("INR"), active template ID |
| **Typical Size** | 50 KB – 500 KB per file | ~250 bytes per file | < 1 KB total |
| **Capacity** | Bound only by device storage (unlimited) | Fast in-memory array (10,000 files ≈ 2.5 MB) | Tiny key-value storage |
| **Lifecycle** | Loaded on-demand only when opening/saving | Loaded on startup; updated atomically on CRUD | Read on mount / settings update |

---

## 📁 Key & Record Structure

### 1. Document Record (`inv_doc_${id}`)
Contains the full spreadsheet payload and invoice metadata:
```json
{
  "id": "inv_1725184000000",
  "name": "Acme Corp Invoice",
  "templateId": "100001",
  "billType": 1,
  "total": 4500,
  "invoiceNumber": "INV-001",
  "invoiceDate": "2026-09-01",
  "fromDetails": null,
  "billToDetails": { "name": "Acme Corp" },
  "items": null,
  "content": "msc%3Acurrentid%3Asheet1%0Asheet%3Acell%3AA1%3Av%3A1000%0A...",
  "createdAt": "2026-09-01T08:00:00.000Z",
  "modifiedAt": "2026-09-01T10:30:00.000Z"
}
```

### 2. Lightweight Index Record (`invoices_index`)
Contains the lightweight search & table metadata without bulky `content`:
```json
[
  {
    "id": "inv_1725184000000",
    "name": "Acme Corp Invoice",
    "templateId": "100001",
    "billType": 1,
    "total": 4500,
    "invoiceNumber": "INV-001",
    "invoiceDate": "2026-09-01",
    "fromDetails": null,
    "billToDetails": { "name": "Acme Corp" },
    "createdAt": "2026-09-01T08:00:00.000Z",
    "modifiedAt": "2026-09-01T10:30:00.000Z",
    "docKey": "inv_doc_inv_1725184000000"
  }
]
```

---

## 🔄 100% Backward Compatibility Layer

To guarantee that previous user data is never lost, the storage layer implements seamless two-way backward compatibility:

1. **Reading Invoices (`getAllInvoices` / `_getAllFiles`)**:
   - Queries the modern `invoices_index` in Preferences.
   - Reads legacy invoices from `localStorage.getItem('ls_invoices')`.
   - Scans direct `window.localStorage` file keys.
   - Merges without duplicates (latest `modifiedAt` wins).
2. **Opening Invoices (`getInvoiceById` / `_getFile`)**:
   - Checks Preferences `inv_doc_${id}`.
   - Checks standalone Preferences key `${id}`.
   - Falls back to `ls_invoices` in `localStorage`.
   - Falls back to direct `localStorage.getItem(id)`.
3. **Saving Invoices (`saveInvoice` / `_saveFile`)**:
   - Writes the full document to Preferences (`inv_doc_${id}`).
   - Updates the lightweight index (`invoices_index`).
   - Syncs existing entries in `ls_invoices` to keep them up to date.
4. **Deleting Invoices (`deleteInvoice` / `_deleteFile`)**:
   - Removes document and index entry from Preferences.
   - Removes entry from `ls_invoices` and `localStorage.removeItem(id)`.
5. **Non-Destructive Startup Migration (`src/data/migration.ts`)**:
   - `runMigration()` automatically detects legacy `ls_invoices` on startup (`initializeDataLayer()`).
   - Copies unmigrated items into Preferences without deleting original `localStorage` data.

---

## 🚫 Removal of 15 / 8 File Limits

- **`invoiceRepository.canCreateInvoice()`**: Always returns `true`.
- **`localTemplateService.maxInvoices`**: Set to `MAX_INVOICES = Infinity`.
- **UI Blocking Alerts Removed**:
  - `src/components/Files/Files.tsx`: Limit alerts removed during invoice creation and cloud import.
  - `src/pages/InvoicePage.tsx`: Limit alerts removed in `handleSaveCopyToLocal`.
  - `src/components/InvoicePage/FileMenu/FileOptions.tsx`: Limit alerts removed in `handleSaveAs` and `handleNewFileClick`.
  - `src/components/DashboardLayout.tsx`: Limit alert removed in `handleCreateInvoice`.

---

## ⚡ Performance & Benchmark Comparison

| Metric | Legacy `localStorage` Model | New Preferences + Index Model |
|---|---|---|
| **Max Safe File Capacity** | 15 files (hard limit) | **Unlimited (device storage)** |
| **Storage Quota Ceiling** | ~5 MB total for all files | **Multi-MB / GBs (device storage)** |
| **File List Load Overhead** | Parses multi-MB payload for all files | Reads only ~250B metadata index |
| **Auto-save Overhead** | Parses & rewrites entire array of files | Writes 1 document record + index |
| **Crash Vulnerability** | `QuotaExceededError` on large libraries | **Zero storage quota errors** |
