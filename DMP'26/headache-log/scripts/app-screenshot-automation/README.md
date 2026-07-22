# App Store Screenshot Automation

This folder contains a Playwright script designed to automate high-resolution screenshot generation for Apple App Store submissions.

It emulates all major iPhone and iPad screen sizes required by App Store Connect:
*   **6.9" Display**: iPhone 16 Pro Max (1320x2868 px)
*   **6.5" Display**: iPhone 14 Plus / 13 Pro Max (1284x2778 px)
*   **6.1" Display**: iPhone 16 / 15 / 14 / 13 / 12 (1170x2532 px)
*   **13" iPad**: iPad Pro 13" (2064x2752 px)
*   **11" iPad**: iPad Pro 11" (1668x2388 px)

The automation script navigates through the following flow:
1.  **Welcome Screen** (Onboarding page)
2.  **Roster Template Sheets** (Walks through and captures tabs/sheets inside the loaded template)
3.  **Saves Multiple Files** (Creates and saves two roster instances)
4.  **Cell Edit Form** (Simulates clicking an editable cell to open the value/color properties editor modal)
5.  **Files Page** (Saved files manager showcasing the newly created schedules)
6.  **Settings Page** (App settings screen)

---

## Configuration (`screenshot-config.json`)

You can customize the automation flow using `screenshot-config.json` in this directory. This allows the script to work seamlessly across different spreadsheet templates and layouts without modifying the codebase:

```json
{
  "baseUrl": "http://localhost:3000",
  "saveFileNameA": "Weekly Schedule A",
  "saveFileNameB": "Weekly Schedule B",
  "editCellMobile": "D5",
  "editCellTablet": "D5",
  "editValue": "$25.00",
  "maxTabsMobile": null,
  "maxTabsTablet": null
}
```

### Configuration Fields:
*   `baseUrl`: The URL of the local running development server.
*   `saveFileNameA` & `saveFileNameB`: The names of the files that will be created and saved. Space characters are dynamically slugified into hyphens (`-`) for URL routing checks.
*   `editCellMobile`: The coordinate of the cell to click on iPhone viewports to trigger the edit modal (e.g. `"D5"`). **Must be an editable cell in your active sheet.**
*   `editCellTablet`: The coordinate of the cell to click on iPad viewports to trigger the edit modal (e.g. `"D5"`).
*   `editValue`: Fallback value passed to custom event edit request if coordinates fail.
*   `maxTabsMobile`: Limit the number of template tabs to click and capture on iPhone screens (set to `null` to capture all tabs).
*   `maxTabsTablet`: Limit the number of template tabs to click and capture on iPad/Tablet screens (set to `null` to capture all tabs).

---

## Prerequisites

1.  Node.js (v18 or higher recommended).
2.  Make sure the local application development server is running (e.g., `npm run dev` on `http://localhost:3000`).

## Installation

Navigate to this folder and install the required dependencies (Playwright and browser binaries):

```bash
cd app-listing-automation
npm install
npm run install-playwright
```

## Running the Automation

### 1. Capture All Devices (Headless/Background)
Run the script to capture all screens for all viewports in the background:
```bash
npm run capture
```

### 2. Capture a Single Screen size (Headed/Visible with Slow Motion)
To run the browser visibly and watch the automation step-by-step for a single device, pass the device key and `--headed` or `-h` option:
```bash
# Available device keys: iphone69, iphone65, iphone61, ipad13, ipad11
node capture-screenshots.js iphone61 --headed
```

### 3. Run with Custom URL via Environment Variable
```bash
APP_URL=http://localhost:3000 npm run capture
```

The screenshots will be saved inside the `screenshots/` directory, grouped by device screen size.
