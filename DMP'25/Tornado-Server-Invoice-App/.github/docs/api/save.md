# Save Handler API

## Endpoint
`GET/POST /save`

## Description
Legacy file operations API that handles JSON-based file saving and retrieval for user spreadsheets and documents. Primarily designed for the original web application interface.

## Authentication Required
Yes - Session cookie or JWT token

## Request Methods

### GET - Display User Files

**URL**: `/save`

**Description**: Displays all files in the user's home directory through a web interface.

**Response**: HTML page (`allusersheets.html`) showing user's files

**Template Variables:**
- `user`: Current authenticated user email
- `entries`: List of user files

### POST - Save File Content

**Content-Type**: `application/x-www-form-urlencoded`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fname` | string | Yes | Filename to save |
| `data` | string | Yes | JSON string content to save |

**Response:**
```json
{
  "data": "Done"
}
```

## File Storage Structure

Files are stored in the user's directory with the following path structure:
```
/home/{user_email}/{filename}
```

## Usage Examples

### Traditional Web Form
```html
<form action="/save" method="POST">
  <input type="text" name="fname" placeholder="Filename" required>
  <textarea name="data" placeholder="JSON content" required></textarea>
  <button type="submit">Save</button>
</form>
```

### JavaScript/AJAX Save
```javascript
const saveFile = async (filename, jsonData) => {
  const response = await fetch('/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      fname: filename,
      data: JSON.stringify(jsonData)
    })
  });
  
  const result = await response.json();
  console.log('Save result:', result);
};

// Example usage
const spreadsheetData = {
  user: "user@example.com",
  fname: "my-spreadsheet",
  data: {
    cells: [
      { row: 1, col: 1, value: "Name" },
      { row: 1, col: 2, value: "Age" },
      { row: 2, col: 1, value: "John" },
      { row: 2, col: 2, value: 30 }
    ]
  }
};

saveFile('my-spreadsheet', spreadsheetData);
```

### cURL Example
```bash
curl -X POST http://localhost:8080/save \
  -H "Cookie: user=your-session-cookie" \
  -d "fname=my-document&data={\"content\":\"Hello World\"}"
```

## File Creation and Updates

### New File Creation
- If the file doesn't exist, it will be created
- The file is stored in the user's home directory
- Content is stored as provided JSON string

### File Updates
- If the file already exists, it will be updated with new content
- Previous content is completely replaced
- No versioning or backup is maintained

## Default File Structure

When a user first accesses `/save`, if no files exist, a default file is created:

```json
{
  "user": "user@example.com",
  "fname": "default",
  "data": "\n"
}
```

## User Directory Management

The system automatically:
1. Creates user home directory if it doesn't exist: `/home/{user_email}/`
2. Creates a default file if the directory is empty
3. Lists all files in the user's directory for the GET request

## Error Handling

### Authentication Required
If user is not authenticated, redirects to `/dev` (fallback page)

### File Operations
- File creation and updates use the cloud storage system
- Errors in storage operations are logged but may not be explicitly returned to user
- Success is indicated by the response `{"data": "Done"}`

## Data Format

The `data` parameter should contain a JSON string. Common formats include:

### Spreadsheet Data
```json
{
  "user": "user@example.com",
  "fname": "spreadsheet1",
  "data": {
    "cells": [
      {"row": 1, "col": 1, "value": "A1"},
      {"row": 1, "col": 2, "value": "B1"}
    ],
    "metadata": {
      "created": "2024-01-15",
      "modified": "2024-01-15"
    }
  }
}
```

### Document Data
```json
{
  "user": "user@example.com",
  "fname": "document1",
  "data": {
    "content": "Document content here",
    "title": "My Document",
    "tags": ["important", "draft"]
  }
}
```

## Integration with Modern APIs

For modern applications, consider using the [File Operations API](fileops.md) instead, which provides:
- Better file type support
- Binary file handling
- Proper HTTP status codes
- RESTful design
- File metadata preservation

## Template Integration

The GET endpoint renders the `allusersheets.html` template with:
- User information
- List of user files
- Navigation and UI elements

## Related Endpoints

- [File Operations](fileops.md) - `GET/POST /fileops` (Modern file API)
- [User Login](login.md) - `POST /login` (Authentication)
- [User Registration](register.md) - `POST /register`

## Migration Notes

If migrating from this API to the File Operations API:
1. Convert JSON data to proper file formats
2. Update client code to use multipart/form-data for uploads
3. Handle binary files appropriately
4. Update authentication to use JWT tokens if needed
