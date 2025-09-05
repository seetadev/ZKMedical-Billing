# User Login API

## Endpoint
`POST /login`

## Description
Authenticates a user with email and password credentials. Supports both traditional web application authentication (cookie-based) and modern React application authentication (JWT token-based).

## Authentication Required
No

## Request Parameters

### Body Parameters (Form Data)
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | User's email address |
| `password` | string | Yes | User's password |
| `react_app` | string | No | Set to any value to enable JWT token response for React apps |

## Response

### Success Response (Traditional Web App)
**Code:** `302 Found`
**Redirect:** `/save`
**Cookies:** Sets user session cookie

### Success Response (React App)
**Code:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "user": "user@example.com",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "redirect": "/save"
}
```

### Error Response (Traditional Web App)
**Code:** `302 Found`
**Redirect:** `/login`

### Error Response (React App)
**Code:** `401 Unauthorized`
```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

## Usage Examples

### Traditional Web Application
```html
<form action="/login" method="POST">
  <input type="email" name="email" required>
  <input type="password" name="password" required>
  <button type="submit">Login</button>
</form>
```

### React Application
```javascript
const loginUser = async (email, password) => {
  const response = await fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      email: email,
      password: password,
      react_app: 'true'
    })
  });

  const data = await response.json();
  
  if (data.success) {
    // Store JWT token for future requests
    localStorage.setItem('authToken', data.token);
    // Redirect to dashboard
    window.location.href = data.redirect;
  } else {
    console.error('Login failed:', data.message);
  }
};
```

### cURL Example
```bash
# Traditional login
curl -X POST http://localhost:8080/login \
  -d "email=user@example.com&password=yourpassword"

# React app login
curl -X POST http://localhost:8080/login \
  -d "email=user@example.com&password=yourpassword&react_app=true"
```

## JWT Token Usage

After successful login with `react_app` parameter, use the returned JWT token in subsequent API requests:

```javascript
fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

## Security Notes

- Passwords are hashed using SHA256 with salt
- JWT tokens are signed with a secret key
- Always use HTTPS in production
- JWT tokens should be stored securely (consider httpOnly cookies for web apps)

## Related Endpoints

- [User Registration](register.md) - `POST /register`
- [File Operations](fileops.md) - `GET/POST /fileops` (requires authentication)
- [Save Handler](save.md) - `GET/POST /save` (requires authentication)
