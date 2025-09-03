# Firebase Template Collections Setup Guide

This guide will help you set up Firebase Firestore collections for storing additional templates that can be loaded dynamically in your SocialCalc application.

## Prerequisites

- Firebase project set up with Firestore enabled
- Firebase configuration properly set in your environment variables
- Access to Firebase Console

## Collection Structure

You need to create two collections in your Firestore database:

### 1. `templatesMetaData` Collection

This collection stores metadata about each template including name, category, image, and description.

**Collection Path:** `/templatesMetaData`

**Document Structure:**

- **Document ID:** Use unique template IDs (e.g., 2001, 2002, etc.) - must be different from app template IDs (1001+)
- **Fields:**
  ```javascript
  {
    name: string,           // Display name of the template
    category: string,       // "Mobile", "Web", "Tablet", etc.
    description?: string,   // Optional description
    ImageUri?: string,      // Optional base64 encoded image
    createdAt?: timestamp,  // Optional creation date
    updatedAt?: timestamp   // Optional last update date
  }
  ```

**Example Document (ID: 2001):**

```javascript
{
  name: "Modern Invoice Template",
  category: "Web",
  description: "A clean and modern invoice template suitable for businesses",
  ImageUri: "iVBORw0KGgoAAAANSUhEUgAAAV...", // base64 image string
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 2. `templatesData` Collection

This collection stores the actual template data including MSC content, footers, and cell mappings.

**Collection Path:** `/templatesData`

**Document Structure:**

- **Document ID:** Must match the template ID from `templatesMetaData`
- **Fields:**
  ```javascript
  {
    template: string,        // Template name
    templateId: number,      // Same as document ID
    category: string,        // Same as in metadata
    msc: object,            // SocialCalc MSC data structure
    footers: array,         // Footer configurations
    logoCell: string|object, // Logo cell reference
    signatureCell: string|object, // Signature cell reference
    cellMappings: object     // Cell mapping configuration
  }
  ```

**Example Document (ID: 2001):**

```javascript
{
  template: "Modern Invoice Template",
  templateId: 2001,
  category: "Web",
  msc: {
    numsheets: 1,
    currentid: "sheet1",
    currentname: "invoice",
    sheetArr: {
      sheet1: {
        sheetstr: {
          savestr: "version:1.5\ncell:A1:t:Invoice..."
        },
        name: "invoice",
        hidden: "0"
      }
    },
    EditableCells: {
      allow: true,
      cells: {
        "invoice!A1": true,
        // ... more editable cells
      },
      constraints: {}
    }
  },
  footers: [
    {
      name: "Invoice",
      index: 1,
      isActive: true
    }
  ],
  logoCell: "F5",
  signatureCell: "D38",
  cellMappings: {
    sheet1: {
      Heading: "A1",
      Date: "B1",
      // ... more cell mappings
    }
  }
}
```

## Setup Steps

### Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to "Firestore Database"

### Step 2: Create Collections

#### Create `templatesMetaData` Collection:

1. Click "Start collection"
2. Enter collection ID: `templatesMetaData`
3. Add your first document:
   - Document ID: `2001` (or any unique number > 2000)
   - Fields:
     - `name` (string): "Sample Firebase Template"
     - `category` (string): "Web"
     - `description` (string): "A sample template from Firebase"

#### Create `templatesData` Collection:

1. Click "Start collection" (or add collection if already created above)
2. Enter collection ID: `templatesData`
3. Add your first document:
   - Document ID: `2001` (same as metadata)
   - Fields: Use the structure shown above

### Step 3: Set Security Rules

Update your Firestore security rules to allow read access to the template collections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to template collections
    match /templatesMetaData/{document} {
      allow read: if true;
    }

    match /templatesData/{document} {
      allow read: if true;
    }

    // Your other security rules...
  }
}
```

### Step 4: Test the Setup

1. Open your SocialCalc application
2. Navigate to create a new file
3. Click on the "More" tab in the template selection modal
4. Your Firebase templates should appear after loading

## Template ID Guidelines

- Use template IDs starting from 2001 or higher
- Keep IDs consistent between `templatesMetaData` and `templatesData`
- Avoid conflicts with existing app template IDs (1001-1999)

## Creating MSC Content

To create the MSC content for your templates:

1. Use the existing SocialCalc editor to design your template
2. Export the file data
3. Extract the MSC content from the exported data
4. Use this MSC content in your Firebase template document

## Troubleshooting

### Templates Not Loading

- Check Firebase console for any errors
- Verify collection names are exactly `templatesMetaData` and `templatesData`
- Ensure security rules allow read access
- Check browser console for any network errors

### Template Structure Validation Errors

- Ensure all required fields are present in both collections
- Verify MSC structure is valid SocialCalc format
- Check that footers array contains at least one footer with `isActive: true`

### Template ID Conflicts

- Use unique template IDs not used by app templates
- Ensure both collections use the same document ID for matching templates

## Example Firebase Rules for Production

For production environments, you might want more restrictive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read templates
    match /templatesMetaData/{document} {
      allow read: if request.auth != null;
    }

    match /templatesData/{document} {
      allow read: if request.auth != null;
    }

    // Admin-only write access
    match /templatesMetaData/{document} {
      allow write: if request.auth != null &&
        request.auth.token.admin == true;
    }

    match /templatesData/{document} {
      allow write: if request.auth != null &&
        request.auth.token.admin == true;
    }
  }
}
```

This setup ensures that users can load additional templates from Firebase while maintaining the core functionality of local templates.
