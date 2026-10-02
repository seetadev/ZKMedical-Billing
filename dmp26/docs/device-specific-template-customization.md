# Device-Specific Template Selection & Standalone Single-Sheet Customization

## 1. Overview
This document outlines the architectural implementation for device-sensitive template selection and isolated single-sheet customization in the Invoice app.

The app provides dedicated invoice layouts optimized for different device form factors:
- **Mobile Phones (`mobile`)**: Compact, single-column stacked layout (`100001`), optimized for portrait handheld devices.
- **iPads / Tablets / Desktops (`tablet`)**: Side-by-side expanded multi-column layout (`100002`), optimized for landscape and larger screens.

Users can customize individual sheets from built-in templates into standalone single-sheet custom templates without mixing sheets or multiple footers, while keeping the default built-in multi-sheet templates completely intact for regular invoice generation.

---

## 2. Device Sensitivity Architecture

### Detection Helper (`src/utils/device.ts`)
- **`getAppDevice()`**: Detects `'mobile'` vs `'tablet'` based on:
  1. Capacitor / Ionic platform detection (`isPlatform('ipad')`, `isPlatform('tablet')`, `isPlatform('desktop')`).
  2. iPad User-Agent inspection (handling iOS 13+ desktop-class Safari reporting `Macintosh` with `navigator.maxTouchPoints > 1`).
  3. Responsive viewport width (`window.innerWidth >= 768` classified as tablet/desktop class).
- **`getDeviceDefaultBuiltinTemplateId(deviceOverride?)`**: Returns `'100001'` on mobile and `'100002'` on iPad/tablet.

---

## 3. Template System Structure

### Built-in Templates
- **Mobile Built-in (`100001`)**:
  - `Sheet 1`: **Invoice 1** (Standard single-item layout with vertical client & business details)
  - `Sheet 2`: **Invoice 2** (Expanded items layout with rates and quantity calculations)
  - `Sheet 3`: **Invoice 3** (Detailed summary invoice with tax and discount breakdowns)
  - `Sheet 4`: **Invoice 4** (Compact modern invoice with high-density totals)
- **iPad / Desktop Built-in (`100002`)**:
  - `Sheet 1`: **Invoice 1** (Wide desktop invoice with side-by-side Bill To & From details)
  - `Sheet 2`: **Invoice 2** (Multi-column layout with Purchase Order & Due Date columns)
  - `Sheet 3`: **Company 1** (Corporate layout with branded header and tax calculation tables)
  - `Sheet 4`: **Company 2** (Commercial layout with payment terms and bank account rows)

### Single-Sheet Pre-generated Datasets (`public/templates/data/single-sheet/`)
- `public/templates/data/single-sheet/mobile/`: Individual sheets 1 to 4 extracted from `100001.json`.
- `public/templates/data/single-sheet/ipad/` & `tablet/`: Individual sheets 1 to 4 extracted from `100002.json`.

---

## 4. Standalone Single-Sheet Customization Workflow

### Dynamic Extraction (`customTemplateService.extractSingleSheet`)
When a user selects an individual sheet (e.g. `sheet2` - "Invoice 2") from CustomizePage:
1. The template data is loaded.
2. `extractSingleSheet` isolates `sheet2`, maps it as `sheet1` in a single-sheet MSC object (`numsheets: 1`, `sheetArr: { sheet1: ... }`).
3. An isolated single footer is created: `[{ name: 'Invoice 2', index: 1, isActive: true }]`.
4. SocialCalc initializes with only this single sheet.

### Standalone Custom Template Storage
- Custom templates are saved with `device: 'mobile' | 'tablet'`.
- They contain only the single sheet and its own footer.
- The user cannot accidentally switch to or mix other sheets or footers.

### Clean Resolution on Invoice Creation
- In `CustomizePage`:
  - Mobile view displays only mobile custom templates and mobile built-in templates.
  - iPad/Desktop view displays only tablet/desktop custom templates and iPad built-in templates.
  - Users can switch views via the clean `IonSegment` device selector.
- In `InvoicePage` & `Files`:
  - When creating a new invoice, `customTemplateService.resolveTemplateForNewInvoice()` resolves the device-appropriate active default template.

---

## 5. Verification
- **Automated Tests**:
  - `src/services/customTemplateService.test.ts`: Unit tests verifying single sheet extraction, device filtering, and default template resolution.
  - Full test suite: 27 passing tests across 5 test suites.
- **Compilation**: Full production build (`npm run build`) succeeded with 0 errors.
