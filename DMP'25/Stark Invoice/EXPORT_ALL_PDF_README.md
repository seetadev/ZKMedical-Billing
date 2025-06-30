# Export All Sheets as PDF Feature

## Overview

This feature allows users to export all sheets in their workbook as a single combined PDF document, with each invoice starting on a new page.

## Files Modified/Created

### 1. `/src/services/exportAllSheetsAsPdf.ts` (New File)

- **Purpose**: Core service for exporting multiple sheets as a combined PDF
- **Key Features**:
  - Exports all sheets with each sheet starting on a new page
  - Adds sheet titles for better organization
  - Supports both mobile sharing and desktop download
  - Progress tracking for user feedback
  - High-quality rendering with configurable options

### 2. `/src/components/socialcalc/index.js` (Modified)

- **Added Functions**:
  - `getAllSheetsData()`: Retrieves HTML content for all sheets in the workbook
  - `getWorkbookInfo()`: Gets basic workbook information (number of sheets, sheet names)

### 3. `/src/components/Menu/Menu.tsx` (Modified)

- **Added State Variables**:
  - `showAlert8`: Controls the filename input dialog for export all PDF
  - `isExportingAllPDF`: Loading state for the export process
  - `exportAllProgress`: Progress message display
- **Added Functions**:
  - `doExportAllSheetsAsPDF()`: Main function that handles the export process
  - `showExportAllPDFNameDialog()`: Shows the filename input dialog
- **UI Additions**:
  - New action sheet button "Export All Sheets as PDF" with documents icon
  - Input dialog for PDF filename
  - Loading dialog with progress messages

## How It Works

### Desktop Flow

1. User clicks "Export All Sheets as PDF" from the menu
2. System prompts for filename (defaults to `{current_file}_all_sheets`)
3. System collects HTML content from all sheets
4. Each sheet is rendered with a title header
5. PDF is generated with each sheet on a new page
6. File is automatically downloaded

### Mobile Flow

1. Same as desktop until step 5
2. PDF is generated as a blob
3. File is saved to device cache
4. Native sharing dialog is opened
5. User can share via any installed app

## Technical Implementation

### Sheet Processing

- Each sheet is temporarily activated to get its current HTML content
- Sheet titles are automatically added as headers
- Original sheet selection is restored after processing

### PDF Generation

- Uses html2canvas for high-quality rendering
- jsPDF for PDF creation and page management
- Each sheet starts on a new page automatically
- Handles multi-page content within individual sheets
- Configurable quality and format options

### Error Handling

- Validates that sheets exist before processing
- Graceful fallback for sharing failures on mobile
- Comprehensive error messages for users
- Cleanup of temporary DOM elements

## Usage Examples

### Basic Usage

```typescript
// This is handled automatically when user clicks the menu option
const sheetsData = AppGeneral.getAllSheetsData();
await exportAllSheetsAsPDF(sheetsData, {
  filename: "my_invoices",
  format: "a4",
  orientation: "portrait"
});
```

### With Progress Tracking

```typescript
await exportAllSheetsAsPDF(sheetsData, {
  filename: "invoices_combined",
  onProgress: (message) => {
    console.log(message); // "Processing sheet 1/3..."
  }
});
```

## Configuration Options

### ExportAllSheetsOptions Interface

- `filename`: Output filename (default: "all_invoices")
- `format`: Paper format - "a4", "letter", "legal" (default: "a4")
- `orientation`: "portrait" or "landscape" (default: "portrait")
- `margin`: Page margins in mm (default: 10)
- `quality`: Rendering quality scale (default: 2)
- `onProgress`: Callback for progress updates
- `returnBlob`: Return blob instead of downloading (for mobile sharing)

## User Experience Features

### Visual Feedback

- Progress messages during export ("Processing sheet 1/3...")
- Loading dialogs with specific status updates
- Success/error toast notifications

### Mobile Optimization

- Native sharing integration using Capacitor
- Automatic fallback to direct download if sharing fails
- Optimized rendering for mobile devices

### File Organization

- Automatic sheet naming (Sheet 1, Sheet 2, etc.)
- Clear visual separation between sheets
- Professional header styling

## Error Recovery

- Network issues: Retry mechanism
- Memory issues: Quality reduction fallback
- Sharing failures: Direct download fallback
- Missing content: Clear error messages

## Performance Considerations

- Progressive rendering to avoid UI blocking
- Memory cleanup after each sheet
- Configurable quality settings for performance tuning
- Background processing indicators

## Browser Compatibility

- Modern browsers with Canvas API support
- Mobile browser optimization
- Progressive enhancement for older browsers
