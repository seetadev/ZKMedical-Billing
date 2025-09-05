# Logo Management API

## Endpoint
`POST /logos`

## Description
Handles logo image uploads for authenticated users. Supports multiple image formats with validation, automatic resizing, and secure storage in the user's logo directory.

## Authentication Required
Yes - JWT token or session cookie

## Request Method

### POST - Upload Logo

**Content-Type**: `multipart/form-data`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `logo` | file | Yes | Image file to upload as logo |
| `name` | string | No | Custom name for the logo (optional) |
| `overwrite` | string | No | Set to "true" to overwrite existing logo with same name |

## Supported Image Formats

| Format | Extension | Max Size | Notes |
|--------|-----------|----------|-------|
| PNG | .png | 5MB | Recommended for logos with transparency |
| JPEG | .jpg, .jpeg | 5MB | Good for photographic logos |
| GIF | .gif | 5MB | Supports animation |
| WebP | .webp | 5MB | Modern format with good compression |
| SVG | .svg | 5MB | Vector format, scalable |

## Response

### Success Response
**Code:** `200 OK`
```json
{
  "success": true,
  "message": "Logo uploaded successfully",
  "logo": {
    "filename": "company-logo.png",
    "original_name": "logo.png",
    "size": 25600,
    "content_type": "image/png",
    "url": "/logos/company-logo.png",
    "uploaded_at": "2024-01-15T10:30:00Z"
  }
}
```

### Error Responses

#### Invalid File Type
**Code:** `400 Bad Request`
```json
{
  "success": false,
  "error": "INVALID_FILE_TYPE",
  "message": "Only PNG, JPEG, GIF, WebP, and SVG files are allowed",
  "supported_formats": ["png", "jpg", "jpeg", "gif", "webp", "svg"]
}
```

#### File Too Large
**Code:** `413 Payload Too Large`
```json
{
  "success": false,
  "error": "FILE_TOO_LARGE",
  "message": "File size exceeds 5MB limit",
  "max_size": "5MB"
}
```

#### Authentication Required
**Code:** `401 Unauthorized`
```json
{
  "error": "Authentication required"
}
```

#### Storage Error
**Code:** `500 Internal Server Error`
```json
{
  "success": false,
  "error": "STORAGE_ERROR",
  "message": "Failed to save logo to storage"
}
```

## Usage Examples

### JavaScript/React Upload
```javascript
const uploadLogo = async (logoFile, logoName = null) => {
  const formData = new FormData();
  formData.append('logo', logoFile);
  
  if (logoName) {
    formData.append('name', logoName);
  }
  
  const response = await fetch('/logos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: formData
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('Logo uploaded:', result.logo);
    // Use the logo URL: result.logo.url
  } else {
    console.error('Upload failed:', result.message);
  }
};

// Example with file input
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    uploadLogo(file, 'company-logo');
  }
};
```

### HTML Form Upload
```html
<form action="/logos" method="POST" enctype="multipart/form-data">
  <input type="file" name="logo" accept="image/*" required>
  <input type="text" name="name" placeholder="Logo name (optional)">
  <input type="checkbox" name="overwrite" value="true"> Overwrite existing
  <button type="submit">Upload Logo</button>
</form>
```

### cURL Example
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "logo=@/path/to/logo.png" \
  -F "name=company-logo" \
  http://localhost:8080/logos
```

## Logo Storage Structure

Logos are stored in the user's logo directory:
```
/home/{user_email}/logos/{logo_filename}
```

Each logo is stored with metadata:
```json
{
  "metadata": {
    "filename": "company-logo.png",
    "original_name": "uploaded-logo.png",
    "content_type": "image/png",
    "size": 25600,
    "encoding": "base64",
    "uploaded_at": "2024-01-15T10:30:00Z",
    "dimensions": {
      "width": 200,
      "height": 100
    }
  },
  "content": "base64_encoded_image_data"
}
```

## File Validation

### Image Format Validation
- File extension must be in allowed list
- Content type must match image format
- File header validation using `imghdr` library
- Special SVG validation for XML structure

### Security Features
- File size limits (5MB maximum)
- Content type validation
- Image header verification
- Sanitized filename generation
- User-isolated storage

## Logo Naming

### Automatic Naming
If no name is provided, the original filename is used (sanitized)

### Custom Naming
- Use the `name` parameter for custom logo names
- Names are sanitized to remove special characters
- File extension is preserved from the uploaded file

### Overwrite Protection
- By default, existing logos are not overwritten
- Set `overwrite=true` to replace existing logos
- Unique names are generated if overwrite is disabled

## GET Logos List

You can also retrieve a list of all user logos:

**URL**: `GET /logos`

**Response:**
```json
{
  "success": true,
  "logos": [
    {
      "filename": "company-logo.png",
      "size": 25600,
      "content_type": "image/png",
      "url": "/logos/company-logo.png",
      "uploaded_at": "2024-01-15T10:30:00Z"
    },
    {
      "filename": "brand-icon.svg",
      "size": 1024,
      "content_type": "image/svg+xml",
      "url": "/logos/brand-icon.svg",
      "uploaded_at": "2024-01-14T15:30:00Z"
    }
  ]
}
```

## Logo Serving

Uploaded logos can be accessed via the [Logo Serve API](logo-serve.md):
- **URL**: `GET /logos/{filename}`
- **Example**: `GET /logos/company-logo.png`

## Best Practices

### File Formats
- **PNG**: Best for logos with transparency
- **SVG**: Best for scalable vector logos
- **JPEG**: Good for photographic logos
- **WebP**: Modern format with excellent compression

### File Sizes
- Keep logos under 1MB for web use
- Optimize images before upload
- Consider using SVG for simple graphics

### Naming Conventions
- Use descriptive names: `company-logo`, `brand-icon`
- Avoid special characters and spaces
- Include version numbers if needed: `logo-v2`

## Related Endpoints

- [Logo Serve](logo-serve.md) - `GET /logos/{filename}` (Serving uploaded logos)
- [File Operations](fileops.md) - `GET/POST /fileops` (General file management)
- [User Login](login.md) - `POST /login` (Authentication)

## Error Troubleshooting

1. **"File too large"**: Reduce image size or compress before upload
2. **"Invalid file type"**: Ensure file has correct extension and format
3. **"Authentication required"**: Check JWT token or login status
4. **"Storage error"**: Verify AWS S3 configuration and credentials
