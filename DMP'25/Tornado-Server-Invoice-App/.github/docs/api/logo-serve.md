# Logo Serve API

## Endpoint
`GET /logos/{filename}`

## Description
Serves uploaded logo images directly to clients with proper content types and caching headers. Provides secure access to user's logo files with efficient delivery.

## Authentication Required
Yes - JWT token or session cookie

## Request Method

### GET - Serve Logo Image

**URL Pattern**: `/logos/{filename}`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filename` | string | Yes | Name of the logo file to serve (in URL path) |

**Examples:**
- `GET /logos/company-logo.png`
- `GET /logos/brand-icon.svg`
- `GET /logos/user-avatar.jpg`

## Response

### Success Response
**Code:** `200 OK`

**Headers:**
- `Content-Type`: Appropriate MIME type for the image (e.g., `image/png`, `image/svg+xml`)
- `Content-Length`: Size of the image file in bytes
- `Cache-Control`: `max-age=3600` (1 hour caching)
- `ETag`: File hash for cache validation

**Body:** Binary image data

### Error Responses

#### File Not Found
**Code:** `404 Not Found`
```json
{
  "error": "Logo not found",
  "filename": "nonexistent-logo.png"
}
```

#### Authentication Required
**Code:** `401 Unauthorized`
```json
{
  "error": "Authentication required"
}
```

#### Invalid Filename
**Code:** `400 Bad Request`
```json
{
  "error": "Invalid filename",
  "message": "Filename contains invalid characters"
}
```

## Supported MIME Types

| File Extension | MIME Type | Description |
|----------------|-----------|-------------|
| `.png` | `image/png` | Portable Network Graphics |
| `.jpg`, `.jpeg` | `image/jpeg` | Joint Photographic Experts Group |
| `.gif` | `image/gif` | Graphics Interchange Format |
| `.webp` | `image/webp` | WebP Image Format |
| `.svg` | `image/svg+xml` | Scalable Vector Graphics |

## Usage Examples

### Direct Image URLs
```html
<!-- In HTML -->
<img src="/logos/company-logo.png" alt="Company Logo">

<!-- With authentication header (for AJAX requests) -->
<img id="logo" alt="Company Logo">
<script>
  fetch('/logos/company-logo.png', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  })
  .then(response => response.blob())
  .then(blob => {
    document.getElementById('logo').src = URL.createObjectURL(blob);
  });
</script>
```

### JavaScript/React Usage
```javascript
// Direct usage (if user is authenticated via cookies)
const LogoComponent = ({ logoName }) => {
  return (
    <img 
      src={`/logos/${logoName}`} 
      alt="Logo"
      onError={(e) => {
        e.target.src = '/default-logo.png'; // Fallback
      }}
    />
  );
};

// With JWT authentication
const LogoWithAuth = ({ logoName, authToken }) => {
  const [logoUrl, setLogoUrl] = useState(null);
  
  useEffect(() => {
    fetch(`/logos/${logoName}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    .then(response => {
      if (response.ok) {
        return response.blob();
      }
      throw new Error('Logo not found');
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      setLogoUrl(url);
    })
    .catch(error => {
      console.error('Failed to load logo:', error);
    });
    
    // Cleanup
    return () => {
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl);
      }
    };
  }, [logoName, authToken]);
  
  return logoUrl ? <img src={logoUrl} alt="Logo" /> : <div>Loading...</div>;
};
```

### CSS Background Images
```css
/* Note: This requires cookie-based authentication */
.logo-background {
  background-image: url('/logos/company-logo.png');
  background-size: contain;
  background-repeat: no-repeat;
  width: 200px;
  height: 100px;
}
```

### cURL Download
```bash
# Download logo file
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o company-logo.png \
  http://localhost:8080/logos/company-logo.png

# Check if logo exists
curl -I -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/logos/company-logo.png
```

## Security Features

### Access Control
- Only authenticated users can access logos
- Users can only access their own logos
- Filenames are validated to prevent directory traversal

### File Validation
- Only serves files from the user's logo directory
- Validates file existence before serving
- Sanitizes filename input

### Caching
- Appropriate cache headers for efficient loading
- ETag support for cache validation
- Browser caching reduces server load

## Performance Considerations

### Caching Strategy
- Images are cached for 1 hour by default
- Use ETags for efficient cache validation
- Consider CDN for production deployments

### File Size Optimization
- Logos are limited to 5MB during upload
- Consider serving different sizes for different use cases
- WebP format provides better compression

## Error Handling

### Common Scenarios
```javascript
const handleLogoLoad = async (logoName) => {
  try {
    const response = await fetch(`/logos/${logoName}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.status === 404) {
      console.log('Logo not found, using default');
      return '/default-logo.png';
    }
    
    if (response.status === 401) {
      console.log('Authentication required');
      // Redirect to login or refresh token
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
    
  } catch (error) {
    console.error('Failed to load logo:', error);
    return '/error-logo.png';
  }
};
```

## Logo Management Workflow

### Complete Logo Lifecycle
```javascript
// 1. Upload logo
const uploadResult = await fetch('/logos', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

// 2. Get logo URL from upload response
const { logo } = await uploadResult.json();
const logoUrl = logo.url; // e.g., "/logos/company-logo.png"

// 3. Display logo
document.getElementById('logo').src = logoUrl;

// 4. List all logos
const logosResponse = await fetch('/logos', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { logos } = await logosResponse.json();

// 5. Display multiple logos
logos.forEach(logo => {
  const img = document.createElement('img');
  img.src = logo.url;
  document.body.appendChild(img);
});
```

## Related Endpoints

- [Logo Upload](logos.md) - `POST /logos` (Upload new logos)
- [File Operations](fileops.md) - `GET/POST /fileops` (General file management)
- [User Login](login.md) - `POST /login` (Authentication)

## Best Practices

1. **Always handle errors**: Provide fallback images for missing logos
2. **Use appropriate sizes**: Serve logos at the size they'll be displayed
3. **Cache efficiently**: Leverage browser caching for better performance
4. **Optimize images**: Use appropriate formats and compression
5. **Security**: Always validate authentication before serving images
