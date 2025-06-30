# Server Files Integration

## Overview

This document outlines the implementation of a new "Server Files" tab in the Files component that allows users to authenticate with PostgreSQL via email/password and manage their files on the server.

## Backend Implementation

### 1. Authentication Handler (`references/auth.py`)

- **Login Handler**: Authenticates users with email/password
- **Register Handler**: Creates new user accounts
- **JWT Token Management**: Secure token-based authentication
- **Password Hashing**: SHA-256 hashing for security

### 2. Server Files Handler (`references/server_files.py`)

- **File Management**: Upload, download, delete, and list files
- **Authentication Required**: All operations require valid JWT token
- **S3 Integration**: Files stored in S3 with database metadata
- **User Isolation**: Users can only access their own files

### 3. Database Schema Requirements

The following database tables are required:

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User files table
CREATE TABLE user_files (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    filename VARCHAR(255) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Frontend Implementation

### 1. Server Files Service (`src/services/serverFiles.ts`)

- **Authentication Management**: Login, register, token storage
- **File Operations**: Upload, download, delete, list files
- **Error Handling**: Comprehensive error handling and user feedback
- **API Integration**: RESTful API calls to backend handlers

### 2. Files Component Updates

The Files component has been enhanced with:

#### New State Variables:

```typescript
// Server files state
const [serverFiles, setServerFiles] = useState<ServerFile[]>([]);
const [serverFilesLoading, setServerFilesLoading] = useState(false);
const [showLoginModal, setShowLoginModal] = useState(false);
const [showRegisterModal, setShowRegisterModal] = useState(false);
const [showUploadModal, setShowUploadModal] = useState(false);
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [uploadingFile, setUploadingFile] = useState(false);
const [deletingFile, setDeletingFile] = useState<number | null>(null);

// Auth state
const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({
  email: "",
  password: "",
});
const [registerCredentials, setRegisterCredentials] = useState<RegisterCredentials>({
  name: "",
  email: "",
  password: "",
});
```

#### New File Source:

```typescript
const [fileSource, setFileSource] = useState<"local" | "blockchain" | "server">("local");
```

#### Updated Segment Control:

```tsx
<IonSegment
  className="smaller-segment-text"
  value={fileSource}
  onIonChange={(e) =>
    setFileSource(e.detail.value as "local" | "blockchain" | "server")
  }
>
  <IonSegmentButton value="local">
    <IonLabel>Local Files</IonLabel>
  </IonSegmentButton>
  <IonSegmentButton value="blockchain">
    <IonLabel>Blockchain Files</IonLabel>
  </IonSegmentButton>
  <IonSegmentButton value="server">
    <IonLabel>Server Files</IonLabel>
  </IonSegmentButton>
</IonSegment>
```

## Key Features

### 1. Authentication Flow

- **Login Modal**: Email/password authentication
- **Register Modal**: New user registration
- **Token Persistence**: JWT tokens stored in localStorage
- **Auto-logout**: Automatic logout on token expiration

### 2. File Management

- **Upload**: Drag-and-drop or file picker upload
- **Download**: Direct file download with proper filename
- **Delete**: Secure file deletion with confirmation
- **List**: Grouped by date with search functionality

### 3. User Experience

- **Loading States**: Spinners for all async operations
- **Error Handling**: Toast notifications for all errors
- **Search**: Real-time search across all file sources
- **Responsive Design**: Mobile-friendly interface

## API Endpoints

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### File Management

- `GET /server-files` - List user files
- `POST /server-files/upload` - Upload new file
- `GET /server-files/download/{file_id}` - Download file
- `DELETE /server-files/delete/{file_id}` - Delete file

## Security Features

### 1. Authentication

- JWT token-based authentication
- Password hashing with SHA-256
- Token expiration (24 hours)
- Automatic token refresh

### 2. Authorization

- User isolation (users can only access their own files)
- Token validation on all endpoints
- Secure file storage in S3

### 3. Input Validation

- Email format validation
- Password strength requirements
- File type and size validation

## Integration Steps

### 1. Backend Setup

1. Install required Python packages:

   ```bash
   pip install tornado psycopg2-binary boto3 PyJWT
   ```

2. Set up PostgreSQL database with required tables

3. Configure S3 credentials and bucket

4. Update SECRET_KEY in auth.py and server_files.py

### 2. Frontend Setup

1. Update API_BASE_URL in `src/services/serverFiles.ts`

2. Replace the existing Files.tsx with the updated version

3. Install any additional dependencies if needed

### 3. Server Configuration

1. Set up CORS headers for cross-origin requests
2. Configure proper error handling
3. Set up logging for debugging

## Usage

### 1. User Registration

1. Click on "Server Files" tab
2. Click "Register" button
3. Fill in name, email, and password
4. Submit registration

### 2. User Login

1. Click on "Server Files" tab
2. Click "Login" button
3. Enter email and password
4. Submit login

### 3. File Management

1. **Upload**: Click "Upload File" button, select file, and upload
2. **Download**: Click download icon on any file
3. **Delete**: Click trash icon on any file
4. **Search**: Use search bar to filter files

## Error Handling

### Common Errors

- **401 Unauthorized**: Invalid or expired token
- **404 Not Found**: File doesn't exist
- **500 Internal Server Error**: Server-side error
- **Network Error**: Connection issues

### User Feedback

- Toast notifications for all operations
- Loading spinners for async operations
- Clear error messages
- Automatic logout on authentication errors

## Future Enhancements

### 1. Additional Features

- File sharing between users
- File versioning
- File encryption
- Bulk operations

### 2. Performance Improvements

- File compression
- Lazy loading
- Caching
- CDN integration

### 3. Security Enhancements

- Two-factor authentication
- Rate limiting
- Audit logging
- File integrity checks

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure proper CORS configuration
2. **Database Connection**: Check PostgreSQL connection settings
3. **S3 Access**: Verify S3 credentials and bucket permissions
4. **Token Issues**: Clear localStorage and re-login

### Debug Steps

1. Check browser console for errors
2. Verify API endpoints are accessible
3. Test database connectivity
4. Validate S3 bucket access

## Conclusion

The Server Files integration provides a complete file management solution with:

- Secure user authentication
- Comprehensive file operations
- Excellent user experience
- Robust error handling
- Scalable architecture

This implementation follows best practices for security, performance, and maintainability while providing a seamless user experience.
