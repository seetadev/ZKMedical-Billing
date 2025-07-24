# Signature Management System Documentation

## Overview

The Signature Management System allows users to create, upload, manage, and apply digital signatures to invoices. This feature provides two methods of signature creation: drawing with a signature pad and uploading signature image files. Users can store up to 3 signatures and apply them to their invoices through an intuitive interface.

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Dependencies](#dependencies)
4. [File Structure](#file-structure)
5. [Implementation Details](#implementation-details)
6. [API Functions](#api-functions)
7. [User Interface](#user-interface)
8. [Data Storage](#data-storage)
9. [Validation Rules](#validation-rules)
10. [Usage Examples](#usage-examples)
11. [Troubleshooting](#troubleshooting)

## Features

### ✅ Core Features

- **Signature Pad Drawing**: Interactive canvas for drawing signatures with customizable pen settings
- **Signature Upload**: Upload signature images from device with comprehensive validation
- **Signature Management**: Create, edit, delete, and select signatures
- **Signature Application**: Apply signatures to invoices at predefined coordinates
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Consistent theming across all signature interfaces
- **Persistent Storage**: Signatures saved to localStorage for cross-session availability
- **Real-time Preview**: Live preview of uploaded signature files

### 🎨 Signature Pad Features

- **Pen Color Selection**: 6 predefined colors (Black, Blue, Red, Green, Purple, Brown)
- **Pen Width Control**: Adjustable pen width from 1px to 8px
- **Canvas Trimming**: Automatic removal of empty space around signatures
- **High-DPI Support**: Proper scaling for high-resolution displays
- **Touch/Mouse Support**: Compatible with both touch and mouse input
- **Signature Editing**: Edit existing signatures with preserved settings

### 📤 Upload Features

- **File Type Validation**: Support for PNG, JPG, JPEG, GIF, WebP, SVG
- **File Size Validation**: Maximum 50KB file size limit
- **Dimension Validation**: Proper aspect ratio and size constraints
- **Live Preview**: Real-time preview of uploaded files before saving
- **Error Handling**: Comprehensive validation with user-friendly error messages

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Settings      │    │   FileOptions    │    │  SocialCalc     │
│   Page          │    │   Component      │    │  Integration    │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ • Create        │    │ • Apply          │    │ • Coordinates   │
│ • Upload        │    │ • Remove         │    │ • Logo System   │
│ • Edit          │    │ • Select         │    │ • Sheet Access  │
│ • Delete        │    │ • Modal          │    │ • Command Exec  │
│ • Select        │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                │
                    ┌──────────────────┐
                    │   localStorage   │
                    │   Storage        │
                    ├──────────────────┤
                    │ • userSignatures │
                    │ • selectedId     │
                    │ • JSON Format    │
                    └──────────────────┘
```

## Dependencies

### Core Dependencies

```json
{
  "react-signature-canvas": "^1.0.5",
  "@ionic/react": "^7.0.0",
  "@capacitor/camera": "^5.0.0",
  "@capacitor/core": "^5.0.0"
}
```

### Icons Used

- `createOutline` - Signature creation and management
- `add` - Add new signature
- `cloudUploadOutline` - Upload signature
- `imageOutline` - Image/file selection
- `saveOutline` - Save operations
- `pencil` - Edit signature
- `trash` - Delete signature
- `checkmark` - Selection indicator
- `close` - Modal close buttons

### Ionic Components Used

- `IonModal` - Signature creation and upload modals
- `IonCard`, `IonCardHeader`, `IonCardContent` - UI containers
- `IonButton` - Interactive buttons
- `IonIcon` - Icons throughout the interface
- `IonRange` - Pen width control slider
- `IonPopover` - Color picker interface
- `IonToast` - User feedback notifications
- `IonGrid`, `IonRow`, `IonCol` - Responsive layout

## File Structure

```
src/
├── pages/
│   └── SettingsPage.tsx           # Main signature management interface
├── components/
│   ├── NewFile/
│   │   └── FileOptions.tsx        # Signature application in invoices
│   └── socialcalc/
│       └── index.js              # Signature coordinate handling
├── services/
│   └── cloud-service.ts          # Future cloud signature storage
└── contexts/
    └── ThemeContext.tsx          # Dark/light theme support
```

### Key Files Modified

#### 1. `SettingsPage.tsx` - Primary signature management

- **Purpose**: Complete signature lifecycle management
- **New State Variables**:
  ```typescript
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showUploadSignatureModal, setShowUploadSignatureModal] = useState(false);
  const [savedSignatures, setSavedSignatures] = useState<Array<{id: string; data: string; name: string}>>([]);
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | null>(null);
  const [selectedSignatureFile, setSelectedSignatureFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [penColor, setPenColor] = useState("#000000");
  const [penWidth, setPenWidth] = useState(2);
  ```

#### 2. `FileOptions.tsx` - Signature application in invoices

- **Purpose**: Apply signatures to invoice documents
- **New State Variables**:
  ```typescript
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [userSignatures, setUserSignatures] = useState<Array<{id: string; data: string; name: string}>>([]);
  ```

#### 3. `socialcalc/index.js` - Coordinate system

- **Purpose**: Define signature placement coordinates
- **New Functions**:
  ```javascript
  export function getSignatureCoordinates()
  ```

## Implementation Details

### Signature Creation Workflow

1. **User Interaction**

   ```typescript
   const handleAddSignature = () => {
     if (savedSignatures.length >= 3) {
       // Show limit error
       return;
     }
     setShowSignatureModal(true);
   };
   ```

2. **Canvas Initialization**

   ```typescript
   React.useEffect(() => {
     if (showSignatureModal && signatureRef.current) {
       const canvas = signatureRef.current.getCanvas();
       const dpr = window.devicePixelRatio || 1;
       canvas.width = 500 * dpr;
       canvas.height = 200 * dpr;
       // Set CSS size and scale context
     }
   }, [showSignatureModal]);
   ```

3. **Signature Trimming**

   ```typescript
   const getTrimmedCanvas = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
     // Find bounding box of non-transparent pixels
     // Create new canvas with trimmed dimensions
     // Add padding and white background
     return trimmedCanvas;
   };
   ```

4. **Data Persistence**
   ```typescript
   const handleSaveSignature = () => {
     const trimmedCanvas = getTrimmedCanvas(originalCanvas);
     const signatureData = trimmedCanvas.toDataURL("image/png", 0.9);

     const newSignature = {
       id: Date.now().toString(),
       data: signatureData,
       name: `Signature ${Date.now()}`
     };

     localStorage.setItem("userSignatures", JSON.stringify(updatedSignatures));
   };
   ```

### Upload Validation System

#### File Type Validation

```typescript
const allowedTypes = [
  "image/png", "image/jpeg", "image/jpg",
  "image/gif", "image/webp", "image/svg+xml"
];
if (!allowedTypes.includes(file.type)) {
  // Show error
}
```

#### Size Validation

```typescript
const maxSize = 50 * 1024; // 50KB
if (file.size > maxSize) {
  setToastMessage(`File size too large. Maximum ${Math.round(maxSize / 1024)}KB allowed.`);
}
```

#### Dimension Validation

```typescript
const validateImageDimensions = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      const aspectRatio = width / height;

      // Validate ranges
      const minWidth = 50, maxWidth = 800;
      const minHeight = 30, maxHeight = 400;
      const maxAspectRatio = 10, minAspectRatio = 0.1;

      // Check all constraints
      if (width < minWidth || width > maxWidth) {
        // Handle width error
      }
      // Additional checks...
      resolve(true);
    };
    img.src = uploadPreview;
  });
};
```

### Signature Application System

#### Coordinate Configuration

```javascript
// socialcalc/index.js
export function getSignatureCoordinates() {
  const deviceType = getDeviceType();
  const SIGNATURE = {
    iPad: { sheet1: null, sheet2: null, sheet3: null, sheet4: null },
    iPhone: { sheet1: null, sheet2: null, sheet3: null, sheet4: null, sheet5: null },
    Android: { sheet1: null, sheet2: null, sheet3: null, sheet4: null, sheet5: null },
    default: { sheet1: "D31", sheet2: "D31", sheet3: "C36", sheet4: "C36" }
  };
  return SIGNATURE[deviceType] || SIGNATURE.default;
}
```

#### Application Process

```typescript
const handleSelectSignature = async (signature: {id: string; data: string; name: string}) => {
  try {
    const signatureCoordinates = AppGeneral.getSignatureCoordinates();
    await AppGeneral.addLogo(signatureCoordinates, signature.data);

    setToastMessage("Signature added successfully!");
    setShowSignatureModal(false);
  } catch (error) {
    setToastMessage("Failed to add signature. Please try again.");
  }
};
```

#### Removal Process

```typescript
const handleRemoveSignature = () => {
  try {
    const signatureCoordinates = AppGeneral.getSignatureCoordinates();
    AppGeneral.removeLogo(signatureCoordinates)
      .then(() => {
        setToastMessage("Signature removed successfully");
        setShowSignatureModal(false);
      });
  } catch (error) {
    setToastMessage("Error removing signature");
  }
};
```

## API Functions

### Core Functions

#### `getSignatureCoordinates()`

```javascript
/**
 * Returns device-specific signature placement coordinates
 * @returns {Object} Coordinate mapping for each sheet
 */
export function getSignatureCoordinates() {
  const deviceType = getDeviceType();
  return SIGNATURE[deviceType] || SIGNATURE.default;
}
```

#### `handleAddSignature(signature_url: string)`

```typescript
/**
 * Applies signature to current invoice at predefined coordinates
 * @param signature_url - Base64 data URL of the signature
 */
const handleAddSignature = async (signature_url: string) => {
  const signatureCoordinates = AppGeneral.getSignatureCoordinates();
  await AppGeneral.addLogo(signatureCoordinates, signature_url);
};
```

#### `handleRemoveSignature()`

```typescript
/**
 * Removes signature from current invoice
 */
const handleRemoveSignature = () => {
  const signatureCoordinates = AppGeneral.getSignatureCoordinates();
  AppGeneral.removeLogo(signatureCoordinates);
};
```

### Utility Functions

#### `fetchUserSignatures()`

```typescript
/**
 * Loads signatures from localStorage
 */
const fetchUserSignatures = () => {
  try {
    const saved = localStorage.getItem("userSignatures");
    if (saved) {
      const signatures = JSON.parse(saved);
      setUserSignatures(signatures);
    }
  } catch (error) {
    console.error("Error loading signatures:", error);
    setUserSignatures([]);
  }
};
```

#### `validateImageDimensions(file: File)`

```typescript
/**
 * Validates uploaded image dimensions
 * @param file - File object to validate
 * @returns Promise<boolean> - True if valid, false otherwise
 */
const validateImageDimensions = (file: File): Promise<boolean> => {
  // Implementation details in code above
};
```

## User Interface

### Settings Page Interface

#### Signature Management Card

```typescript
<IonCard className={isDarkMode ? "auth-card-dark" : "auth-card-light"}>
  <IonCardHeader style={{ paddingBottom: "20px" }}>
    <IonCardTitle>
      <IonIcon icon={createOutline} />
      Manage Signatures
    </IonCardTitle>
  </IonCardHeader>
  <IonCardContent>
    {/* Signature grid with None option */}
    {/* Action buttons: Upload and Add */}
  </IonCardContent>
</IonCard>
```

#### Signature Creation Modal

- **Header**: Title with pen settings (color, width)
- **Canvas**: 500x200px signature pad with proper scaling
- **Controls**: Clear and Save buttons
- **Features**: Real-time pen customization

#### Upload Modal

- **File Selection**: Drag-and-drop style interface
- **Requirements Panel**: Clear validation rules display
- **Preview Section**: Live preview of selected file
- **Validation**: Real-time error feedback

### FileOptions Interface

#### Menu Integration

```typescript
<IonItem button onClick={handleOpenSignatureModal}>
  <IonLabel>Add Signature</IonLabel>
  <IonIcon icon={createOutline} slot="end" />
</IonItem>
```

#### Signature Selection Modal

```typescript
<IonModal isOpen={showSignatureModal}>
  <IonHeader>
    <IonTitle>Select Signature</IonTitle>
  </IonHeader>
  <IonContent>
    {/* None option for removal */}
    {/* Signature cards grid */}
    {/* Empty state message */}
  </IonContent>
</IonModal>
```

## Data Storage

### LocalStorage Schema

#### userSignatures

```json
[
  {
    "id": "1642734521000",
    "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "name": "Signature 1642734521000"
  }
]
```

#### selectedSignatureId

```json
"1642734521000"
```

### Storage Operations

#### Save Signature

```typescript
const updatedSignatures = [...savedSignatures, newSignature];
localStorage.setItem("userSignatures", JSON.stringify(updatedSignatures));
```

#### Load Signatures

```typescript
React.useEffect(() => {
  const saved = localStorage.getItem("userSignatures");
  if (saved) {
    try {
      const signatures = JSON.parse(saved);
      setSavedSignatures(signatures);
    } catch (error) {
      setSavedSignatures([]);
    }
  }
}, []);
```

#### Update Selection

```typescript
const handleSelectSignature = (signatureId: string | null) => {
  setSelectedSignatureId(signatureId);
  if (signatureId) {
    localStorage.setItem("selectedSignatureId", signatureId);
  } else {
    localStorage.removeItem("selectedSignatureId");
  }
};
```

## Validation Rules

### Upload Validation

#### File Types

- ✅ PNG (.png)
- ✅ JPEG (.jpg, .jpeg)
- ✅ GIF (.gif)
- ✅ WebP (.webp)
- ✅ SVG (.svg)
- ❌ All other formats

#### File Size

- **Maximum**: 50KB (51,200 bytes)
- **Error Message**: "File size too large. Maximum 50KB allowed. Your file is XKB."

#### Dimensions

- **Width Range**: 50px - 800px
- **Height Range**: 30px - 400px
- **Aspect Ratio**: 0.1 - 10.0 (prevents extreme stretching)
- **Error Messages**: Specific feedback for each constraint violation

### Signature Limits

- **Maximum Signatures**: 3 per user
- **Enforcement**: UI disabled state and error messages
- **Error Message**: "Maximum 3 signatures can be stored. Please delete an existing signature to add a new one."

### Canvas Validation

- **Empty Check**: Prevents saving blank signatures
- **Error Message**: "Please draw a signature first"

## Usage Examples

### Creating a Hand-Drawn Signature

```typescript
// User clicks "Add" button
const handleAddSignature = () => {
  if (savedSignatures.length >= 3) {
    setToastMessage("Maximum 3 signatures can be stored...");
    return;
  }
  setShowSignatureModal(true);
};

// User draws signature and clicks save
const handleSaveSignature = () => {
  if (signatureRef.current?.isEmpty()) {
    setToastMessage("Please draw a signature first");
    return;
  }

  const canvas = signatureRef.current.getCanvas();
  const trimmedCanvas = getTrimmedCanvas(canvas);
  const signatureData = trimmedCanvas.toDataURL("image/png", 0.9);

  // Save to localStorage and update UI
};
```

### Uploading a Signature File

```typescript
// User clicks "Upload" button
const handleUploadSignature = () => {
  if (savedSignatures.length >= 3) {
    setToastMessage("Maximum 3 signatures can be stored...");
    return;
  }
  setShowUploadSignatureModal(true);
};

// User selects file
const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Validate file type, size, and dimensions
  // Create preview and set file for saving
};
```

### Applying Signature to Invoice

```typescript
// User opens signature modal from FileOptions menu
const handleOpenSignatureModal = () => {
  setShowSignatureModal(true);
  fetchUserSignatures();
};

// User selects a signature
const handleSelectSignature = async (signature) => {
  const signatureCoordinates = AppGeneral.getSignatureCoordinates();
  await AppGeneral.addLogo(signatureCoordinates, signature.data);
  setShowSignatureModal(false);
};
```

## Troubleshooting

### Common Issues

#### 1. Canvas Pen Offset Issues

**Problem**: Mouse/touch position doesn't match drawn line
**Solution**: Implemented proper DPI scaling and canvas sizing

```typescript
const dpr = window.devicePixelRatio || 1;
canvas.width = 500 * dpr;
canvas.height = 200 * dpr;
ctx.scale(dpr, dpr);
```

#### 2. Signature Not Applying

**Problem**: Signature doesn't appear on invoice
**Solution**: Check coordinate configuration for current device type

```javascript
// Verify coordinates are defined for current device
const coords = getSignatureCoordinates();
console.log("Signature coordinates:", coords);
```

#### 3. Upload Validation Failures

**Problem**: Valid files being rejected
**Solution**: Check validation parameters and file properties

```typescript
console.log("File type:", file.type);
console.log("File size:", file.size);
console.log("Image dimensions:", img.width, "x", img.height);
```

#### 4. LocalStorage Issues

**Problem**: Signatures not persisting
**Solution**: Check localStorage availability and quota

```typescript
try {
  localStorage.setItem("test", "test");
  localStorage.removeItem("test");
} catch (error) {
  console.error("LocalStorage not available:", error);
}
```

### Error Messages Reference

| Error Type      | Message                                         | Cause                              |
| --------------- | ----------------------------------------------- | ---------------------------------- |
| File Type       | "Invalid file type. Only PNG, JPG..."           | Unsupported file format            |
| File Size       | "File size too large. Maximum 50KB..."          | File exceeds size limit            |
| Dimensions      | "Image width must be between 50px and 800px..." | Invalid image dimensions           |
| Signature Limit | "Maximum 3 signatures can be stored..."         | Trying to exceed signature limit   |
| Empty Canvas    | "Please draw a signature first"                 | Attempting to save blank signature |
| Load Error      | "Unable to load image..."                       | Corrupted or invalid image file    |

## Future Enhancements

### Planned Features

1. **Cloud Sync**: Sync signatures across devices
2. **Advanced Editing**: Signature editing tools (crop, resize, rotate)
3. **Batch Operations**: Import/export multiple signatures
4. **Template Signatures**: Predefined signature styles
5. **Signature History**: Track signature usage and modifications
6. **Enhanced Validation**: More sophisticated image analysis
7. **Compression**: Automatic signature optimization
8. **Security**: Signature encryption and verification

### API Extensions

1. **Cloud Storage Integration**: Server-side signature management
2. **Advanced Coordinates**: Dynamic positioning system
3. **Multi-Sheet Support**: Different signatures per sheet type
4. **Signature Metadata**: Creation date, usage count, etc.

---

## Support

For issues or questions regarding the signature system:

1. Check this documentation for common solutions
2. Review console logs for detailed error messages
3. Verify localStorage availability and quota
4. Test with different file types and sizes
5. Check device compatibility for touch/mouse input

## Version History

- **v1.0.0**: Initial signature pad implementation
- **v1.1.0**: Added upload functionality
- **v1.2.0**: Enhanced validation and error handling
- **v1.3.0**: Improved UI/UX and dark mode support
- **v1.4.0**: Added signature application system
- **v1.5.0**: Complete integration with invoice system
