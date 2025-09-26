# Template ID Management & Validation

## Overview

The admin interface now uses an intelligent template ID system that ensures proper sequencing and validation for new templates uploaded to Firebase.

## Template ID Logic

### ID Assignment Rules

- **Default Range**: Template IDs start from `70001` to avoid conflicts with app templates
- **Dynamic Assignment**: Template ID is determined by the latest invoice ID + 1
- **Fallback Logic**: If no invoices exist, falls back to the highest template ID + 1, or `70001` if no templates exist

### ID Calculation Flow

1. **Primary Source**: Check `invoices` collection for latest `invoiceId`
   - If found: `nextTemplateId = latestInvoiceId + 1`
2. **Secondary Source**: Check `templatesData` collection for latest `templateId`
   - If found: `nextTemplateId = Math.max(latestTemplateId + 1, 70001)`
3. **Default Fallback**: If no documents exist: `nextTemplateId = 70001`

## Validation Requirements

### Template Data Validation

Before upload, template data must pass these checks:

1. **Required Fields**: All essential fields must be present

   - `template`, `templateId`, `category`, `msc`, `footers`
   - `logoCell`, `signatureCell`, `cellMappings`

2. **Template ID Validation**:

   - Must be a number >= `70001`
   - Must match the expected next template ID exactly
   - Prevents conflicts and ensures proper sequencing

3. **Category Validation**:

   - Must be one of: `Mobile`, `Web`, `Tablet`

4. **Structure Validation**:
   - JSON must be valid and well-formed
   - All nested objects must conform to expected schema

### Upload Process

1. **Fetch Next ID**: System queries Firebase to determine next available template ID
2. **Display Expected ID**: Admin interface shows the expected template ID to user
3. **User Preparation**: User must ensure their JSON has the correct `templateId`
4. **Strict Validation**: Upload validates that JSON `templateId` matches expected ID
5. **Atomic Upload**: Both metadata and template data are uploaded together
6. **Error Handling**: Clear error messages for validation failures

## Firebase Collections

### Templates Collections

- **templatesMetaData**: Template metadata (name, category, description, etc.)
- **templatesData**: Template data (msc, footers, cell mappings, etc.)

### Invoices Collection

- **invoices**: Invoice documents with `invoiceId` for tracking latest ID
- Used as primary source for determining next template ID

## Admin Interface Features

### Current Template ID Display

- Shows the expected template ID prominently in the admin interface
- Updates automatically when templates are uploaded
- Provides guidance for JSON preparation

### Validation Feedback

- Real-time validation of template data structure
- Clear error messages for validation failures
- Success confirmation with uploaded template ID

### Security

- Access restricted to authorized email addresses
- Firebase owner email verification required
- Admin-only route protection

## Error Handling

### Common Validation Errors

1. **ID Mismatch**: "Template ID in JSON (X) does not match expected ID (Y)"
2. **Invalid Range**: "Template ID must be a number >= 70001"
3. **Missing Fields**: "Missing required field: [fieldName]"
4. **Invalid Category**: "Category must be one of: Mobile, Web, Tablet"

### Troubleshooting

- Ensure JSON `templateId` matches the displayed expected ID
- Verify all required fields are present in template data
- Check that template ID is >= 70001
- Validate JSON syntax before upload

## Usage Example

```typescript
// Expected template ID: 70001
const templateData = {
  template: "cell_ref|txt:My Template\\n",
  templateId: 70001, // Must match expected ID
  category: "Mobile",
  msc: {},
  footers: [],
  logoCell: "A1",
  signatureCell: "F20",
  cellMappings: {
    "customer_name": "B5",
    "invoice_number": "C18"
  }
};
```

## Benefits

- **Consistency**: Ensures sequential template IDs without gaps
- **Validation**: Prevents upload errors and data corruption
- **Integration**: Links template system with invoice tracking
- **Security**: Robust validation prevents malformed templates
- **User Experience**: Clear feedback and error handling
