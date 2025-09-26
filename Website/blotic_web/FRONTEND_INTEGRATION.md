# Frontend Integration Guide

This document explains how to integrate the frontend with the BLOTIC backend API.

## Registration Form Integration

The registration form should send a POST request to `/api/auth/register` with the following data:

### Request Format

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "9876543210",
  "branch": "CSE",
  "year": "2",
  "domains": ["Web Development", "Designing"],
  "experience": "2 years of web development experience"
}
```

### Response Format

```json
{
  "status": "success",
  "message": "Registration successful! Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "branch": "CSE",
      "year": "2",
      "membershipStatus": "pending",
      "isEmailVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Login Form Integration

The login form should send a POST request to `/api/auth/login` with the following data:

### Request Format

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "rememberMe": true
}
```

### Response Format

```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "branch": "CSE",
      "year": "2",
      "membershipStatus": "active",
      "isEmailVerified": true,
      "role": "member"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Error Handling

All API responses follow a consistent format:

### Success Response

```json
{
  "status": "success",
  "message": "Descriptive message",
  "data": { ... }
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [ ... ] // Optional, for validation errors
}
```

## Authentication

After successful login, the backend returns a JWT token. This token should be stored (preferably in localStorage or sessionStorage) and included in the Authorization header for all subsequent requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Form Validation

The backend performs validation on all input fields. If validation fails, the response will include an errors array:

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "invalid-email",
      "msg": "Please enter a valid email",
      "path": "email",
      "location": "body"
    }
  ]
}
```

## Testing

You can test the API endpoints using the provided test pages:
- `test-registration.html` - Test user registration
- `test-login.html` - Test user login

## Field Requirements

### Registration Fields

| Field | Required | Format/Validation |
|-------|----------|-------------------|
| fullName | Yes | 2-100 characters, letters and spaces only |
| email | Yes | Valid email format, unique |
| password | Yes | Minimum 8 characters, must include uppercase, lowercase, number, and special character |
| phoneNumber | Yes | 10-digit Indian mobile number (starts with 6-9) |
| branch | Yes | One of: CSE, CSBS, CE, IT, ROBOTICS, ECE, E&TC, E&CE, MECHANICAL, CHEMICAL, CIVIL, Other |
| year | Yes | One of: 1, 2, 3, 4, Alumni, Faculty, Other |
| domains | Yes | Array of selected domains from the provided list |
| experience | No | Optional text field, max 500 characters |

### Login Fields

| Field | Required | Format/Validation |
|-------|----------|-------------------|
| email | Yes | Valid email format |
| password | Yes | Minimum 8 characters |
| rememberMe | No | Boolean flag |

## Session Management

The frontend should implement the following session management:

1. Store the JWT token in localStorage or sessionStorage after successful login
2. Include the token in the Authorization header for all authenticated requests
3. Redirect to login page when token expires or is invalid
4. Clear token and user data on logout

## Example JavaScript Integration

```javascript
// Registration
async function registerUser(userData) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Store token and redirect
      localStorage.setItem('token', result.data.token);
      window.location.href = '/dashboard';
    } else {
      // Handle error
      showError(result.message);
    }
  } catch (error) {
    console.error('Registration error:', error);
  }
}

// Login
async function loginUser(loginData) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Store token and user data
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      window.location.href = '/dashboard';
    } else {
      // Handle error
      showError(result.message);
    }
  } catch (error) {
    console.error('Login error:', error);
  }
}

// Authenticated request
async function makeAuthenticatedRequest(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }
  
  return response.json();
}
```