# Admin Interface Documentation

## Overview

The Admin Interface allows Firebase project owners to upload new templates to the Firebase Firestore database. These templates will be available to all users through the "More" tab in the template selection modal.

## Access Control

**Route:** `/app/firebase/library`

**Authorization:** Only users with authorized email addresses can access the admin panel. By default, the following emails are authorized:

- `anisharmasocial@gmail.com` (Primary owner)
- `admin@yourdomain.com` (Example additional admin)

**To add more authorized emails:**

1. Edit `src/pages/AdminPage.tsx`
2. Locate the `authorizedEmails` array in the `useEffect` hook
3. Add new email addresses to the array

## Features

### 1. Template Metadata Management

- **Template Name**: Display name for the template
- **Category**: One of `Mobile`, `Web`, or `Tablet`
- **Description**: Optional brief description
- **Preview Image**: Optional base64-encoded image (max 1MB)

### 2. Template Data Upload

- **JSON Validation**: Validates template structure before upload
- **Auto ID Assignment**: Automatically assigns the next available template ID (starting from 2001)
- **Sample Data Generation**: Provides sample template structure for reference

### 3. Firebase Integration

- Uploads to two Firestore collections:
  - `templatesMetaData`: Contains template metadata and preview information
  - `templatesData`: Contains the actual template data and configuration

## Required Template Structure

```typescript
interface FirebaseTemplateData {
  template: string;           // SocialCalc template string
  templateId: number;         // Unique ID (>= 2001)
  category: string;           // "Mobile", "Web", or "Tablet"
  msc: object;               // MSC object (can be empty {})
  footers: array;            // Array of footer data
  logoCell: string | object; // Cell reference for logo
  signatureCell: string | object; // Cell reference for signature
  cellMappings: object;      // Object mapping field names to cell references
}
```

## Sample Template Data

```json
{
  "template": "cell_ref|txt:Sample Template\\n",
  "templateId": 2001,
  "category": "Mobile",
  "msc": {},
  "footers": [],
  "logoCell": "A1",
  "signatureCell": "F20",
  "cellMappings": {
    "customer_name": "B5",
    "date": "E5",
    "invoice_number": "E6"
  }
}
```

## Usage Instructions

### 1. Accessing the Admin Panel

1. Sign in with an authorized email address
2. Navigate to `/app/firebase/library`
3. The interface will automatically load the next available template ID

### 2. Uploading a New Template

#### Step 1: Fill Template Metadata

- Enter a descriptive template name
- Select the appropriate category (Mobile/Web/Tablet)
- Optionally add a description
- Optionally upload a preview image (max 1MB)

#### Step 2: Provide Template Data

- Paste your template JSON data in the large text area
- Use the "Load Sample Data" button to see the required structure
- Ensure all required fields are present

#### Step 3: Upload

- Click "Upload Template" to save to Firebase
- The system will validate the data before uploading
- Upon success, the form will reset and the template ID will increment

### 3. Validation and Error Handling

- **JSON Validation**: Ensures valid JSON format
- **Structure Validation**: Checks for all required fields
- **ID Validation**: Ensures template ID is >= 2001
- **Category Validation**: Ensures category is valid
- **Image Size Validation**: Ensures images are <= 1MB

## Firebase Collections Structure

### templatesMetaData Collection

```
Document ID: {templateId}
{
  name: string,
  category: string,
  description?: string,
  ImageUri?: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### templatesData Collection

```
Document ID: {templateId}
{
  template: string,
  templateId: number,
  category: string,
  msc: object,
  footers: array,
  logoCell: string|object,
  signatureCell: string|object,
  cellMappings: object
}
```

## Security Features

1. **Authentication Required**: Users must be signed in
2. **Email Authorization**: Only specific emails can access the admin panel
3. **Input Validation**: All inputs are validated before upload
4. **Firebase Security Rules**: Should be configured to restrict write access

## Technical Implementation

### Key Files

- `src/pages/AdminPage.tsx`: Main admin interface component
- `src/pages/AdminPage.css`: Admin interface styles
- `src/firebase/adminService.ts`: Firebase admin operations
- `src/App.tsx`: Route configuration

### Dependencies

- Firebase Firestore for data storage
- Ionic React for UI components
- React hooks for state management

### Admin Service Functions

- `getNextTemplateId()`: Gets the next available template ID
- `uploadTemplate()`: Uploads template metadata and data
- `validateTemplateData()`: Validates template structure

## Error Handling

Common error scenarios and solutions:

1. **Invalid JSON**: Check JSON syntax and format
2. **Missing Required Fields**: Ensure all required fields are present
3. **Invalid Category**: Use only "Mobile", "Web", or "Tablet"
4. **Template ID Conflict**: System automatically handles ID assignment
5. **Image Too Large**: Compress image to under 1MB
6. **Firebase Permission Error**: Check Firebase security rules and authentication

## Best Practices

1. **Template Naming**: Use descriptive, unique names
2. **Category Selection**: Choose the most appropriate device category
3. **Image Optimization**: Compress images for faster loading
4. **Data Backup**: Keep backups of template data before uploading
5. **Testing**: Test templates in the app before making them available to users

## Support and Maintenance

- Monitor Firebase usage and storage limits
- Regularly review and update authorized email list
- Keep template data backed up
- Monitor user feedback on uploaded templates

For technical support or issues with the admin interface, contact the development team or check the Firebase console for error logs.
