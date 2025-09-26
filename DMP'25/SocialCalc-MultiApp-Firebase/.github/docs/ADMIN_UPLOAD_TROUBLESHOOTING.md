# Admin Upload Troubleshooting Guide

## Common JSON Upload Errors & Solutions

### Error: "Invalid JSON format in template data"

This error occurs when the template data you're trying to upload is not valid JSON. Here are the most common causes and solutions:

#### 1. **Copying Raw Data Instead of JSON**

**Problem**: You're copying template data directly from the source code instead of properly formatted JSON.

**Example of INCORRECT format** (this will cause the error):

```
Mobile-Invoice-1
```

**Example of CORRECT format**:

```json
{
  "template": "Mobile-Invoice-1",
  "templateId": 70001,
  "category": "Mobile",
  "footers": [
    { "name": "Invoice", "index": 1, "isActive": true }
  ],
  "logoCell": {
    "sheet1": "F5"
  },
  "signatureCell": {
    "sheet1": "D38"
  },
  "cellMappings": {
    "sheet1": {
      "Heading": "B2",
      "Date": "D20",
      "InvoiceNumber": "C18"
    }
  },
  "msc": {
    "numsheets": 1,
    "currentid": "sheet1",
    "currentname": "inv1",
    "sheetArr": {
      "sheet1": {
        "sheetstr": {
          "savestr": "version:1.5\\ncell:B2:t:INVOICE"
        },
        "name": "inv1",
        "hidden": "0"
      }
    },
    "EditableCells": {
      "allow": true,
      "cells": {
        "inv1!B2": true
      }
    }
  }
}
```

#### 2. **Missing Quotes Around Strings**

**Problem**: String values are not properly quoted.

**Incorrect**:

```json
{
  template: Mobile-Invoice-1
}
```

**Correct**:

```json
{
  "template": "Mobile-Invoice-1"
}
```

#### 3. **Trailing Commas**

**Problem**: Extra commas at the end of objects or arrays.

**Incorrect**:

```json
{
  "template": "Mobile-Invoice-1",
  "category": "Mobile",
}
```

**Correct**:

```json
{
  "template": "Mobile-Invoice-1",
  "category": "Mobile"
}
```

#### 4. **Single Quotes Instead of Double Quotes**

**Problem**: Using single quotes instead of double quotes.

**Incorrect**:

```json
{
  'template': 'Mobile-Invoice-1'
}
```

**Correct**:

```json
{
  "template": "Mobile-Invoice-1"
}
```

## Step-by-Step Upload Process

### 1. **Use the Sample Data Button**

- Click "Load Sample Data" in the admin interface
- This loads a properly formatted JSON template
- Modify the sample data as needed for your template

### 2. **Validate JSON Before Upload**

- Copy your JSON to an online JSON validator (like jsonlint.com)
- Ensure all syntax is correct
- Fix any validation errors before pasting into the admin interface

### 3. **Required Fields Checklist**

Ensure your JSON includes all required fields:

- ✅ `template`: Template name (string)
- ✅ `templateId`: Will be auto-set (number)
- ✅ `category`: Will be auto-set from form (string)
- ✅ `msc`: MSC object (can be empty `{}`)
- ✅ `footers`: Array of footer objects
- ✅ `logoCell`: Cell reference object
- ✅ `signatureCell`: Cell reference object
- ✅ `cellMappings`: Object mapping fields to cells

### 4. **Template ID Validation**

- The system automatically sets `templateId` to the next available ID
- Make sure your JSON `templateId` matches the displayed "Current Template ID"
- The ID must be >= 70001

## How to Convert Existing Template Data

If you have template data from `templates-data.ts`, follow these steps:

### 1. **Identify the Template Object**

Find your template in the DATA object:

```typescript
1001: {
  template: "Mobile-Invoice-1",
  templateId: 1001,
  // ... rest of the data
}
```

### 2. **Extract and Format**

Copy the object content (everything inside the curly braces) and:

- Add double quotes around all property names
- Ensure all string values are double-quoted
- Remove any TypeScript-specific syntax
- Update `templateId` to match the expected ID

### 3. **Use JSON.stringify for Complex Objects**

For complex objects with nested data, use JavaScript console:

```javascript
console.log(JSON.stringify(yourTemplateObject, null, 2));
```

## Testing Your JSON

### Online Validators

- [JSONLint](https://jsonlint.com/)
- [JSON Formatter](https://jsonformatter.curiousconcept.com/)
- [JSON Validator](https://jsonformatter.org/json-validator)

### Browser Console Test

```javascript
try {
  JSON.parse(yourJsonString);
  console.log("Valid JSON!");
} catch (error) {
  console.error("Invalid JSON:", error.message);
}
```

## Template ID Requirements

- **Range**: Must be >= 70001
- **Sequence**: Must match the "Current Template ID" shown in admin interface
- **Auto-Assignment**: The system automatically calculates the next available ID
- **Validation**: Upload will fail if templateId doesn't match expected value

## Example Valid Template

```json
{
  "template": "Custom-Mobile-Invoice",
  "templateId": 70001,
  "category": "Mobile",
  "footers": [
    { "name": "Invoice", "index": 1, "isActive": true }
  ],
  "logoCell": {
    "sheet1": "F5"
  },
  "signatureCell": {
    "sheet1": "D38"
  },
  "cellMappings": {
    "sheet1": {
      "Heading": "B2",
      "Date": "D20",
      "InvoiceNumber": "C18",
      "From": {
        "Name": "C12",
        "StreetAddress": "C13"
      },
      "BillTo": {
        "Name": "C5",
        "StreetAddress": "C6"
      }
    }
  },
  "msc": {
    "numsheets": 1,
    "currentid": "sheet1",
    "currentname": "inv1",
    "sheetArr": {
      "sheet1": {
        "sheetstr": {
          "savestr": "version:1.5\\ncell:B2:t:INVOICE:f:13\\ncell:C5:t:[Customer Name]\\nsheet:c:7:r:42"
        },
        "name": "inv1",
        "hidden": "0"
      }
    },
    "EditableCells": {
      "allow": true,
      "cells": {
        "inv1!B2": true,
        "inv1!C5": true
      }
    }
  }
}
```

## Need Help?

If you're still experiencing issues:

1. Check the browser console for detailed error messages
2. Verify your Firebase authentication and permissions
3. Ensure your template ID matches the expected value
4. Use the "Load Sample Data" button as a starting point
5. Validate your JSON using online tools before upload
