# File Operations API

## Endpoint
`GET/POST /fileops`

## Description
Comprehensive file management API that handles file uploads, downloads, listings, and deletions for authenticated users. Supports both binary and text files with metadata preservation.

## Authentication Required
Yes - JWT token or session cookie

## Request Methods

### GET - List Files or Download File

#### List All User Files
**URL**: `/fileops`

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "filename": "document.pdf",
      "size": 1024,
      "modified": "2024-01-15T10:30:00Z",
      "content_type": "application/pdf"
    },
    {
      "filename": "spreadsheet.xlsx",
      "size": 2048,
      "modified": "2024-01-14T15:45:00Z",
      "content_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
  ]
}
```

#### Download Specific File
**URL**: `/fileops?filename=document.pdf`

**Response:** Binary file content with appropriate headers
- `Content-Type`: Based on file type
- `Content-Disposition`: `attachment; filename="document.pdf"`
- `Content-Length`: File size in bytes

### POST - Upload Files

#### Upload Single File
**Content-Type**: `multipart/form-data`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | file | Yes | File to upload |
| `overwrite` | string | No | Set to "true" to overwrite existing files |

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "filename": "document.pdf",
  "size": 1024,
  "content_type": "application/pdf"
}
```

#### Upload Multiple Files
**Content-Type**: `multipart/form-data`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `files` | file[] | Yes | Multiple files to upload |
| `overwrite` | string | No | Set to "true" to overwrite existing files |

**Response:**
```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "uploaded_files": [
    {
      "filename": "document1.pdf",
      "size": 1024,
      "status": "success"
    },
    {
      "filename": "document2.pdf",
      "size": 2048,
      "status": "success"
    }
  ]
}
```

### DELETE - Delete File

**Content-Type**: `application/json`

**Body:**
```json
{
  "filename": "document.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully",
  "filename": "document.pdf"
}
```

## File Storage Format

Files are stored with metadata in the following JSON structure:
```json
{
  "metadata": {
    "filename": "document.pdf",
    "content_type": "application/pdf",
    "size": 1024,
    "encoding": "base64",
    "uploaded_at": "2024-01-15T10:30:00Z"
  },
  "content": "base64_encoded_file_content"
}
```

## Usage Examples

### JavaScript/React Upload
```javascript
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/fileops', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: formData
  });
  
  const result = await response.json();
  console.log('Upload result:', result);
};
```

### JavaScript/React Download
```javascript
const downloadFile = async (filename) => {
  const response = await fetch(`/fileops?filename=${encodeURIComponent(filename)}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
};
```

### JavaScript/React File List
```javascript
const getFileList = async () => {
  const response = await fetch('/fileops', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  const data = await response.json();
  console.log('User files:', data.files);
};
```

### JavaScript/React Delete File
```javascript
const deleteFile = async (filename) => {
  const response = await fetch('/fileops', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ filename: filename })
  });
  
  const result = await response.json();
  console.log('Delete result:', result);
};
```

### cURL Examples

#### List Files
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/fileops
```

#### Upload File
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  http://localhost:8080/fileops
```

#### Download File
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o downloaded_file.pdf \
  "http://localhost:8080/fileops?filename=document.pdf"
```

#### Delete File
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filename": "document.pdf"}' \
  http://localhost:8080/fileops
```

## File Type Support

### Supported File Types
- **Documents**: PDF, DOC, DOCX, TXT, RTF
- **Spreadsheets**: XLS, XLSX, CSV
- **Images**: PNG, JPG, JPEG, GIF, WebP, SVG
- **Archives**: ZIP, RAR, 7Z
- **Code**: JS, Python, HTML, CSS, JSON, XML
- **Other**: Any file type can be uploaded

### File Size Limits
- Maximum file size: 10MB per file
- Maximum total upload size: 50MB per request

## Error Responses

### Authentication Error
**Code:** `401 Unauthorized`
```json
{
  "error": "Authentication required"
}
```

### File Not Found
**Code:** `404 Not Found`
```json
{
  "error": "File not found"
}
```

### File Too Large
**Code:** `413 Payload Too Large`
```json
{
  "error": "File too large",
  "max_size": "10MB"
}
```

### Storage Error
**Code:** `500 Internal Server Error`
```json
{
  "error": "Storage operation failed",
  "message": "Unable to save file to cloud storage"
}
```

## File Security

- All files are stored in user-specific directories
- File access is restricted to the authenticated user
- File names are validated to prevent directory traversal
- Binary files are base64 encoded for safe storage

## Related Endpoints

- [Save Handler](save.md) - `GET/POST /save` (JSON-based file operations)
- [User Login](login.md) - `POST /login` (Authentication)
- [Logo Management](logos.md) - `POST /logos` (Specialized image uploads)
