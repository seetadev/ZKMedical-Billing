# Direct HTML to PDF Conversion API

## Endpoint

`POST /directhtmltopdf`

## Description

Advanced HTML to PDF conversion service that processes HTML content, downloads external images, converts them to base64, and generates a PDF directly in memory. This endpoint provides immediate PDF download without server-side file storage.

## Authentication Required

Yes - JWT token or session cookie (recommended)

## Request Method

### POST - Convert and Download PDF

**Content-Type**: `application/x-www-form-urlencoded`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `html_content` | string | Yes | Complete HTML content to convert to PDF |
| `options` | string | No | JSON string with PDF generation options |

## PDF Generation Options

Optional JSON parameters to customize PDF output:

```json
{
  "page_size": "A4",
  "orientation": "portrait",
  "margin_top": "0.75in",
  "margin_bottom": "0.75in",
  "margin_left": "0.75in",
  "margin_right": "0.75in",
  "encoding": "UTF-8",
  "javascript_delay": 1000,
  "enable_javascript": true,
  "load_timeout": 30
}
```

## Response

### Success Response

**Code:** `200 OK`
**Content-Type:** `application/pdf`
**Headers:**

- `Content-Disposition`: `attachment; filename="document.pdf"`
- `Content-Length`: Size of PDF in bytes

**Body:** Binary PDF data (direct download)

### Error Responses

#### Invalid HTML Content

**Code:** `400 Bad Request`

```json
{
  "error": "INVALID_HTML",
  "message": "HTML content is required and cannot be empty"
}
```

#### PDF Generation Failed

**Code:** `500 Internal Server Error`

```json
{
  "error": "PDF_GENERATION_FAILED",
  "message": "Failed to generate PDF from HTML content",
  "details": "wkhtmltopdf process failed"
}
```

#### Authentication Required

**Code:** `401 Unauthorized`

```json
{
  "error": "Authentication required"
}
```

## Image Processing Features

### Automatic Image Download

The service automatically:

1. Scans HTML for `<img>` tags with external URLs
2. Downloads images with timeout protection
3. Converts images to base64 data URIs
4. Replaces original URLs with base64 content

### Supported Image Sources

- HTTP/HTTPS URLs
- Images from any accessible web server
- Common formats: PNG, JPEG, GIF, WebP, SVG
- Automatic content-type detection

## Usage Examples

### JavaScript/React PDF Generation

```javascript
const generatePdfDirect = async (htmlContent, options = {}) => {
  const formData = new URLSearchParams();
  formData.append('html_content', htmlContent);

  if (Object.keys(options).length > 0) {
    formData.append('options', JSON.stringify(options));
  }

  try {
    const response = await fetch('/directhtmltopdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Get PDF as blob
    const pdfBlob = await response.blob();

    // Create download link
    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('PDF generation failed:', error);
  }
};

// Example with complex HTML and images
const htmlWithImages = `
<!DOCTYPE html>
<html>
<head>
  <title>Report with Images</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { text-align: center; border-bottom: 2px solid #333; }
    .logo { max-width: 200px; height: auto; }
    .content { margin: 20px 0; }
    .chart { text-align: center; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://example.com/logo.png" alt="Company Logo" class="logo">
    <h1>Monthly Report</h1>
  </div>

  <div class="content">
    <h2>Sales Performance</h2>
    <div class="chart">
      <img src="https://charts.example.com/sales-chart.png" alt="Sales Chart">
    </div>

    <table>
      <tr><th>Month</th><th>Sales</th><th>Growth</th></tr>
      <tr><td>January</td><td>$100,000</td><td>+5%</td></tr>
      <tr><td>February</td><td>$120,000</td><td>+20%</td></tr>
    </table>
  </div>
</body>
</html>
`;

const pdfOptions = {
  page_size: 'A4',
  orientation: 'portrait',
  margin_top: '1in',
  margin_bottom: '1in'
};

generatePdfDirect(htmlWithImages, pdfOptions);
```

### React Component for PDF Generation

```jsx
import React, { useState } from 'react';

const DirectPdfGenerator = () => {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGeneratePdf = async () => {
    if (!htmlContent.trim()) {
      setError('HTML content is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/directhtmltopdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: new URLSearchParams({
          html_content: htmlContent
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'PDF generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-${Date.now()}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sampleHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Sample Document</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { text-align: center; color: #333; }
    .content { margin: 20px 0; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Sample PDF Document</h1>
    <p>Generated on ${new Date().toLocaleDateString()}</p>
  </div>
  <div class="content">
    <h2>Introduction</h2>
    <p>This is a sample document that demonstrates the PDF generation capabilities.</p>
    <img src="https://via.placeholder.com/400x200/0066cc/ffffff?text=Sample+Image" alt="Sample">
  </div>
</body>
</html>`;

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>Direct HTML to PDF Generator</h2>

      <button
        onClick={() => setHtmlContent(sampleHtml)}
        style={{ marginBottom: '10px', padding: '8px 16px' }}
      >
        Load Sample HTML
      </button>

      <textarea
        value={htmlContent}
        onChange={(e) => setHtmlContent(e.target.value)}
        placeholder="Enter your HTML content here..."
        style={{
          width: '100%',
          height: '300px',
          fontFamily: 'monospace',
          padding: '10px',
          border: '1px solid #ddd'
        }}
      />

      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          Error: {error}
        </div>
      )}

      <button
        onClick={handleGeneratePdf}
        disabled={loading || !htmlContent.trim()}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Generating PDF...' : 'Generate & Download PDF'}
      </button>
    </div>
  );
};

export default DirectPdfGenerator;
```

### cURL Example

```bash
# Basic HTML to PDF conversion
curl -X POST http://localhost:8080/directhtmltopdf \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d "html_content=<html><body><h1>Hello World</h1><img src='https://via.placeholder.com/300x200' alt='test'></body></html>" \
  -o document.pdf

# With custom options
curl -X POST http://localhost:8080/directhtmltopdf \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d "html_content=<html><body><h1>Custom Document</h1></body></html>" \
  -d 'options={"page_size":"Letter","orientation":"landscape","margin_top":"1in"}' \
  -o custom-document.pdf
```

## Advanced Features

### Image Processing Pipeline

```javascript
// The service automatically processes images in this order:
// 1. Parse HTML for <img> tags
// 2. Extract image URLs
// 3. Download images with timeout (10 seconds default)
// 4. Validate image content
// 5. Convert to base64 data URI
// 6. Replace original URL in HTML
// 7. Generate PDF with embedded images

const htmlWithExternalImages = `
<html>
<body>
  <!-- These images will be automatically downloaded and embedded -->
  <img src="https://picsum.photos/400/300" alt="Random Image">
  <img src="https://via.placeholder.com/200x100/ff0000/ffffff?text=Red+Box" alt="Red Box">
  <img src="https://httpbin.org/image/png" alt="PNG Image">
</body>
</html>
`;
```

### Custom PDF Options

```javascript
const advancedOptions = {
  page_size: 'A3',              // A4, A3, Letter, Legal, etc.
  orientation: 'landscape',      // portrait, landscape
  margin_top: '2cm',            // CSS units: px, in, cm, mm
  margin_bottom: '2cm',
  margin_left: '1.5cm',
  margin_right: '1.5cm',
  encoding: 'UTF-8',
  javascript_delay: 2000,        // Wait 2 seconds for JS
  enable_javascript: true,
  load_timeout: 45,             // 45 second timeout
  dpi: 300,                     // High quality
  image_quality: 95             // High image quality
};

generatePdfDirect(htmlContent, advancedOptions);
```

## Performance and Limitations

### Image Download Limits

- Maximum 10-second timeout per image
- Automatic retry on network failures
- Graceful fallback for failed downloads
- Content-type validation for security

### PDF Generation Limits

- Maximum HTML size: 10MB
- JavaScript execution timeout: configurable (default 1 second)
- Image processing timeout: 10 seconds per image
- Total conversion timeout: 60 seconds

### Memory Considerations

- Large images are processed in memory
- Multiple concurrent requests may impact performance
- Consider implementing rate limiting for production

## Error Handling and Troubleshooting

### Common Error Scenarios

```javascript
const robustPdfGeneration = async (htmlContent) => {
  try {
    const response = await fetch('/directhtmltopdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${authToken}`
      },
      body: new URLSearchParams({ html_content: htmlContent })
    });

    if (response.status === 401) {
      throw new Error('Authentication required. Please log in.');
    }

    if (response.status === 400) {
      const error = await response.json();
      throw new Error(`Invalid request: ${error.message}`);
    }

    if (response.status === 500) {
      const error = await response.json();
      if (error.details && error.details.includes('wkhtmltopdf')) {
        throw new Error('PDF generation service is temporarily unavailable.');
      }
      throw new Error('Server error during PDF generation.');
    }

    if (!response.ok) {
      throw new Error(`Unexpected error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/pdf')) {
      throw new Error('Invalid response format. Expected PDF.');
    }

    return await response.blob();

  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
};
```

### Troubleshooting Guide

1. **Images not loading in PDF**

   - Check image URLs are publicly accessible
   - Verify image servers allow cross-origin requests
   - Use absolute URLs instead of relative paths

2. **PDF generation timeout**

   - Reduce image sizes
   - Minimize external resources
   - Simplify JavaScript code

3. **Authentication errors**

   - Verify JWT token is valid and not expired
   - Check authentication headers are correctly set

4. **Large file handling**
   - Break large documents into smaller sections
   - Optimize images before including in HTML
   - Use progressive loading for large datasets

## Security Considerations

### Input Validation

- HTML content is processed safely
- External image URLs are validated
- Network timeouts prevent hanging requests
- Content-type verification for downloaded images

### Network Security

- HTTPS preferred for external image URLs
- User-Agent headers set for legitimate requests
- Timeout protection against slow responses
- File size limits to prevent abuse

## Related Endpoints

- [File Operations](fileops.md) - `GET/POST /fileops` (File management)
- [User Login](login.md) - `POST /login` (Authentication)
