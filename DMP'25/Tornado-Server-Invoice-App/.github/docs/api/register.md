# User Registration API

## Endpoint
`POST /register`

## Description
Creates a new user account with email and password. Handles user registration with password hashing and account creation in the cloud storage system.

## Authentication Required
No

## Request Parameters

### Body Parameters (Form Data)
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | User's email address (will be used as username) |
| `password` | string | Yes | User's desired password |
| `confirm_password` | string | Yes | Password confirmation (must match password) |
| `react_app` | string | No | Set to any value to enable JSON response for React apps |

## Response

### Success Response (Traditional Web App)
**Code:** `302 Found`
**Redirect:** `/login`
**Message:** Registration successful, redirects to login page

### Success Response (React App)
**Code:** `200 OK`
```json
{
  "success": true,
  "message": "Registration successful",
  "user": "user@example.com",
  "redirect": "/login"
}
```

### Error Response (React App)
**Code:** `400 Bad Request`
```json
{
  "success": false,
  "error": "REGISTRATION_FAILED",
  "message": "User already exists or invalid data"
}
```

### Error Response (Password Mismatch)
**Code:** `400 Bad Request`
```json
{
  "success": false,
  "error": "PASSWORD_MISMATCH",
  "message": "Passwords do not match"
}
```

## Usage Examples

### Traditional Web Application
```html
<form action="/register" method="POST">
  <input type="email" name="email" placeholder="Email" required>
  <input type="password" name="password" placeholder="Password" required>
  <input type="password" name="confirm_password" placeholder="Confirm Password" required>
  <button type="submit">Register</button>
</form>
```

### React Application
```javascript
const registerUser = async (email, password, confirmPassword) => {
  const response = await fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      email: email,
      password: password,
      confirm_password: confirmPassword,
      react_app: 'true'
    })
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Registration successful:', data.message);
    // Redirect to login page
    window.location.href = data.redirect;
  } else {
    console.error('Registration failed:', data.message);
  }
};
```

### cURL Example
```bash
# Traditional registration
curl -X POST http://localhost:8080/register \
  -d "email=newuser@example.com&password=newpassword&confirm_password=newpassword"

# React app registration
curl -X POST http://localhost:8080/register \
  -d "email=newuser@example.com&password=newpassword&confirm_password=newpassword&react_app=true"
```

## User Account Creation Process

1. **Validation**: Email format and password confirmation are validated
2. **Duplicate Check**: System checks if user already exists
3. **Password Hashing**: Password is hashed using SHA256 with salt via passlib
4. **User Directory**: Creates user's home directory in cloud storage: `/home/{email}/`
5. **Default File**: Creates a default file in user's directory
6. **Account Confirmation**: User account is automatically confirmed

## Account Structure

After registration, the following structure is created:

```
/home/{user_email}/
├── default              # Default user file
└── logos/              # Directory for user logos (created on first logo upload)
```

## Security Features

- **Password Hashing**: Uses SHA256 with salt via passlib library
- **Email Validation**: Basic email format validation
- **Duplicate Prevention**: Prevents registration with existing email
- **Automatic Confirmation**: New accounts are automatically confirmed

## Data Storage

User data is stored in the following format:
```json
{
  "email": "user@example.com",
  "confirmed": true,
  "pwhash": "$5$rounds=535000$...",
  "lastlogin": "",
  "createdon": "",
  "dongle": ""
}
```

## Related Endpoints

- [User Login](login.md) - `POST /login`
- [File Operations](fileops.md) - `GET/POST /fileops`
- [Save Handler](save.md) - `GET/POST /save`

## Common Issues

1. **User Already Exists**: If the email is already registered, registration will fail
2. **Password Mismatch**: Confirm password must exactly match the password
3. **Invalid Email**: Email must be in valid format
4. **Storage Issues**: Ensure AWS S3 credentials are properly configured

## Next Steps

After successful registration:
1. User is redirected to login page
2. User can log in with their credentials
3. User's home directory and default files are ready for use
