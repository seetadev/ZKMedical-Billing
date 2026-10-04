# Custom Template Storage & Subscription Resolution Architecture

## 1. Overview
This document details the architecture for user-created custom template storage in local device storage (`@capacitor/preferences` and `localStorage`) matching the built-in `public/templates/data/{id}.json` standard, along with subscription-aware template resolution.

---

## 2. Storage Schema
Custom templates are saved matching the SocialCalc MultiSheet Calc (`msc`) and `appMapping` schema:

```json
{
  "id": "custom_tpl_1725189200000",
  "name": "Acme Brand Invoice",
  "description": "Customized corporate invoice with logo & headers",
  "type": "custom",
  "device": "mobile",
  "image": "",
  "isCustom": true,
  "isPremium": false,
  "price": {},
  "importedAt": "2026-09-01T18:00:00.000Z",
  "data": {
    "msc": {
      "numsheets": 4,
      "currentid": "sheet1",
      "currentname": "sheet1",
      "sheetArr": {
        "sheet1": {
          "sheetstr": { "savestr": "..." },
          "name": "sheet1",
          "hidden": "0"
        }
      }
    },
    "footers": [
      { "name": "Invoice 1", "index": 1, "isActive": true },
      { "name": "Invoice 2", "index": 2, "isActive": true }
    ],
    "appMapping": {
      "forms": { ... },
      "tables": { ... }
    }
  }
}
```

---

## 3. Key Services & Methods

### `customTemplateService` (`src/services/custom-template-service.ts`)
- **`saveCustomTemplate(input)`**: Validates and writes custom template into `invoiceRepository` (`@capacitor/preferences` + `localStorage`).
- **`getAllCustomTemplates()`**: Retrieves all locally stored custom templates.
- **`getCustomTemplateById(id)`**: Fetches a specific template by unique ID.
- **`deleteCustomTemplate(id)`**: Removes custom template and resets active default if it was selected.
- **`setActiveDefaultTemplateId(id)` / `getActiveDefaultTemplateId()`**: Manages user preference for which template (custom or built-in) opens on "New Invoice".
- **`resolveTemplateForNewInvoice()`**:
  - Checks user's active default template.
  - If **custom template**:
    - **Active Pro/MAX subscriber**: Returns the custom template ID.
    - **Free tier user**: Gracefully falls back to default built-in template (`100002`) with `fallbackUsed: true`.
  - If **built-in template**: Returns the built-in template ID.
- **`exportCustomTemplateToJson(template)` / `importCustomTemplateFromJson(json)`**: Portability helpers for importing/exporting template files.

---

## 4. Subscription & Access Rules

| Action | Free Tier | Pro / MAX Tier |
| :--- | :--- | :--- |
| **Open Template Designer (`/app/plugins-demo`)** | Free | Free |
| **Save Custom Template to Storage** | Free | Free |
| **Set as Default Template** | Allowed | Allowed |
| **New Invoice ("Create / New") with Custom Template Active** | Falls back to default built-in (`100002`) | Loads active Custom Template |
| **Apply / Use Custom Template from Customize Tab** | Prompts Subscription Paywall | Opens Invoice Editor with Custom Template |

---

## 5. Verification & Tests
- **Unit Tests**: `src/services/customTemplateService.test.ts` (6 tests passing).
- **Stress & Storage Tests**: `src/data/repositories/storage-1000-stress.test.ts` (1,000 files stress test passing).
- **Playwright E2E Suite**: `e2e/specs/12-iap-credits-and-subscriptions.spec.ts` (All 5 tests passing).
