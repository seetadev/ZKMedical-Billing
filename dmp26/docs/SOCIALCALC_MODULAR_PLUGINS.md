# SocialCalc Modular Plugins & Switch Architecture

## Overview
This document describes the modular plugin system implemented for SocialCalc (`src/components/InvoicePage/socialcalc`). It allows any React or vanilla JS application to dynamically enable, disable, configure, and toggle SocialCalc plugins at runtime without affecting any existing core functionality.

## Features & Modules

### 1. Plugin Manager (`src/components/InvoicePage/socialcalc/modules/plugin-manager.js`)
Central registry and lifecycle manager for SocialCalc extensions.
- **Functions**:
  - `registerPlugin(name, definition)`
  - `enablePlugin(name, options)`
  - `disablePlugin(name)`
  - `togglePlugin(name, forceState, options)`
  - `isPluginEnabled(name)`
  - `configurePlugin(name, config)`
  - `subscribePluginChanges(listener)`
  - `getActiveEditor()` / `getActiveSpreadsheet()`

### 2. Row & Column Headers Plugin (`src/components/InvoicePage/socialcalc/modules/row-col-headers.js`)
Enables dynamic row numbers (`1, 2, 3...`) and column letters (`A, B, C...`) with modern styling and full interactive spreadsheet functionality:
- **Column Header Click**: Selects and highlights the entire column (`A1:A50`).
- **Column Right-Edge Resize**: Clicking or dragging within 6px of any column's right edge provides smooth column width resizing with real-time vertical guidelines and width badge tooltips (replaces the old legacy buggy resizing gauge).
- **Row Header Click**: Selects and highlights the entire row (`A5:Z5`) and opens the **Row Actions Popover**.
- **Row Actions Popover (`<RowActionPopover />`)**:
  - ⬆️ **Insert Row Above** ("Add row up"): Inserts a row before the selected row.
  - ⬇️ **Insert Row Below** ("Add row down"): Inserts a row after the selected row.
  - 🗑️ **Delete Row**: Deletes the selected row.
- **Controls**:
  - `enableRowColHeaders(customStyles?)`
  - `disableRowColHeaders()`
  - `toggleRowColHeaders(show?)`
  - `selectColumn(colNum)`
  - `selectRow(rowNum)`
  - `insertRowAbove(rowNum)`
  - `insertRowBelow(rowNum)`
  - `deleteRowAt(rowNum)`
  - `setColumnWidth(colNum, width)`

### 3. Horizontal Scroll Slider (`src/components/InvoicePage/socialcalc/modules/horizontal-scroll.js`)
Provides slider controls and left/right arrow buttons to smoothly scroll the spreadsheet horizontally across columns.
- **Controls**:
  - `enableHorizontalScroll()`
  - `disableHorizontalScroll()`
  - `scrollHorizontalBy(delta)`
  - `scrollToColumn(colNum)`
- **React Component**: `<HorizontalScrollBar step={1} />` (`src/components/InvoicePage/socialcalc/components/HorizontalScrollBar.tsx`).

### 4. Grid Lines Plugin (`src/components/InvoicePage/socialcalc/modules/grid-lines.js`)
Toggles cell border grid lines on and off dynamically across the spreadsheet.
- **Controls**:
  - `enableGridLines(gridCss?)`
  - `disableGridLines()`
  - `toggleGridLines(show?)`
  - `isGridLinesEnabled()`

### 5. Portable Cell Edit Modal (`src/components/InvoicePage/socialcalc/components/CellEditModal/`)
Framework-agnostic, portable Cell Edit Modal bundled directly inside SocialCalc.
- **Component**: `<CellEditModal />` (`src/components/InvoicePage/socialcalc/components/CellEditModal/CellEditModal.tsx` & `.css`).
  - Pure React + HTML5/CSS implementation with zero required external dependencies (runs in any React app with or without Ionic).
  - Features: input editing, clear button, text color palette, background color palette, cell borders configuration, inline image/logo compression and insertion, and keyboard offset handling.
  - **HTML / Logo Formatting**: When inserting HTML or `<img>` tags (such as company logos or signatures), SocialCalc commands automatically assign `text th` (HTML text type) and `textvalueformat text-html` so images render directly as DOM elements rather than escaped text.
- **Toggle / Fallback Controls**:
  - `enableCellEditModal()`
  - `disableCellEditModal()`
  - `toggleCellEditModal(show?)`
  - `isCellEditModalEnabled()`

### 6. Fresh Invoice Plugin Playground (`src/pages/InvoicePluginPlayground.tsx`)
A dedicated React page to test fresh invoice creation with SocialCalc.
- **Route**: `/app/plugins-demo` and `/app/test-editor`
- **Ionic 3-Dots Settings Popover**:
  - Header three-dots menu (`IonButton` + `IonPopover`) with Ionic toggles (`IonToggle`, `IonItem`, `IonIcon`, `IonLabel`):
    - 🔢 **Row & Col Headers**
    - ↔️ **Horizontal Slider**
    - 📝 **Cell Edit Modal**
    - 📐 **Show Grid Lines**
