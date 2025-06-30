# CSV Export Feature

## Overview

The CSV export feature allows users to export their invoice/spreadsheet data as CSV (Comma-Separated Values) files. This feature is integrated into the Menu component and works both on desktop and mobile platforms.

## Features

### Desktop

- Direct download of CSV files
- Customizable filename
- Automatic file download via browser

### Mobile (Ionic/Capacitor)

- CSV file sharing via native share functionality
- Temporary file creation for sharing
- Fallback to direct download if sharing fails

## Usage

1. Open the Menu (three-dot menu) in the application
2. Select "Export as CSV" from the action sheet
3. Enter a filename for your CSV file (defaults to current file name or "invoice_data")
4. Click "Export" to generate and download/share the CSV file

## Technical Implementation

### Files Modified/Created

- `src/services/exportAsCsv.ts` - Main CSV export service
- `src/components/Menu/Menu.tsx` - Added CSV export functionality to menu

### Key Functions

#### `exportCSV(csvContent, options)`

- Main export function that handles file creation and download
- Supports both blob return and direct download
- Adds BOM for Excel compatibility
- Handles proper CSV formatting

#### `parseSocialCalcCSV(csvContent)`

- Cleans and formats CSV content from SocialCalc
- Removes empty lines and trims whitespace

#### `doGenerateCSV(filename?)`

- Main function called from the menu
- Handles mobile vs desktop behavior
- Manages loading states and error handling
- Uses SocialCalc's `getCSVContent()` to extract data

### Dependencies

- Uses existing SocialCalc CSV generation (`AppGeneral.getCSVContent()`)
- Ionic/Capacitor for mobile file sharing
- Standard browser APIs for desktop download

## Error Handling

- Validates CSV content before export
- Provides user feedback via toast messages
- Graceful fallback for mobile sharing failures
- Loading indicators during export process

## Platform Compatibility

- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers
- ✅ iOS app (via Capacitor)
- ✅ Android app (via Capacitor)

## File Format

- Standard CSV format with comma delimiters
- UTF-8 encoding with BOM for Excel compatibility
- Proper escaping of quotes and special characters
- Clean formatting with proper line endings
