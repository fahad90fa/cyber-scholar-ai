# Testing Registration Flow

This guide shows how to test the registration endpoint and fix 400 errors.

---

## Quick Start

### 1. Use the Validation Endpoint First

Before attempting to register, validate your data:

```bash
curl -X POST http://localhost:8000/api/v1/auth/validate-registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123!"
  }'
```

**Response (Valid Data):**
```json
{
  "valid": true,
  "message": "Registration data is valid. You can proceed with registration."
}
```

### 2. Register with Valid Data

Once validation passes, register:

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123!"
  }'
```

**Response (Success):**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "123...",
    "email": "test@example.com",
    "username": "testuser",
    "is_active": true,
    "created_at": "2025-12-16T09:00:00"
  }
}
```

---

## Test Cases

### Test 1: Valid Registration

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fahad@example.com",
    "username": "fahad123",
    "password": "Password123!"
  }'
```

**Expected Response:** ✅ 200 OK with access token

---

### Test 2: Invalid Email

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "notanemail",
    "username": "fahad123",
    "password": "Password123!"
  }'
```

**Expected Response:** ❌ 422 Unprocessable Entity
```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "email"],
      "msg": "invalid email format",
      "input": "notanemail"
    }
  ]
}
```

**Or validate first:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/validate-registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "notanemail",
    "username": "fahad123",
    "password": "Password123!"
  }'
```

**Response:**
```json
{
  "valid": false,
  "errors": {
    "email": "Invalid email format. Use: example@domain.com"
  }
}
```

---

### Test 3: Username Too Short

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/validate-registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "ab",
    "password": "Password123!"
  }'
```

**Response:**
```json
{
  "valid": false,
  "errors": {
    "username": "Username must be at least 3 characters"
  }
}
```

---

### Test 4: Username Too Long

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/validate-registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "abcdefghijklmnopqrstuvwxyz1234567",
    "password": "Password123!"
  }'
```

**Response:**
```json
{
  "valid": false,
  "errors": {
    "username": "Username must not exceed 32 characters"
  }
}
```

---

### Test 5: Username with Invalid Characters

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/validate-registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "user@email.com",
    "password": "Password123!"
  }'
```

**Response:**
```json
{
  "valid": false,
  "errors": {
    "username": "Username can only contain letters, numbers, underscores, or hyphens"
  }
}
```

---

### Test 6: Password Missing Uppercase

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/validate-registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123!"
  }'
```

**Response:**
```json
{
  "valid": false,
  "errors": {
    "password": "Password must contain at least one uppercase letter"
  }
}
```

---

### Test 7: Password Missing Lowercase

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/validate-registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "PASSWORD123!"
  }'
```

**Response:**
```json
{
  "valid": false,
  "errors": {
    "password": "Password must contain at least one lowercase letter"
  }
}
```

---

### Test 8: Password Missing Digit

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/validate-registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password!"
  }'
```

**Response:**
```json
{
  "valid": false,
  "errors": {
    "password": "Password must contain at least one digit"
  }
}
```

---

### Test 9: Password Missing Special Character

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/validate-registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123"
  }'
```

**Response:**
```json
{
  "valid": false,
  "errors": {
    "password": "Password must contain at least one special character (!@#$%^&*)"
  }
}
```

---

### Test 10: Password Too Short

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/validate-registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Pwd@1"
  }'
```

**Response:**
```json
{
  "valid": false,
  "errors": {
    "password": "Password must contain at least 8 characters"
  }
}
```

---

### Test 11: Multiple Validation Errors

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/validate-registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid",
    "username": "ab",
    "password": "weak"
  }'
```

**Response:**
```json
{
  "valid": false,
  "errors": {
    "email": "Invalid email format. Use: example@domain.com",
    "username": "Username must be at least 3 characters",
    "password": "Password must contain at least 8 characters and at least one uppercase letter and at least one digit and at least one special character (!@#$%^&*)"
  }
}
```

---

### Test 12: Email Already Registered

**Request (after registering once):**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser2",
    "password": "Password123!"
  }'
```

**Expected Response:** ❌ 400 Bad Request
```json
{
  "detail": "This email is already registered. Please login instead."
}
```

---

## Using Postman

### 1. Create a New POST Request

- **URL:** `http://localhost:8000/api/v1/auth/validate-registration`
- **Method:** POST
- **Header:** `Content-Type: application/json`

### 2. Body (raw JSON)

```json
{
  "email": "test@example.com",
  "username": "testuser",
  "password": "Password123!"
}
```

### 3. Send Request

Click **Send** and check the response.

---

## Frontend Integration

### Example JavaScript Code

```javascript
// Validate before sending to backend
async function validateRegistration(email, username, password) {
  const response = await fetch('/api/v1/auth/validate-registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password })
  });

  const result = await response.json();

  if (!result.valid) {
    // Show validation errors to user
    console.error('Validation errors:', result.errors);
    displayErrors(result.errors);
    return false;
  }

  return true;
}

// Register if validation passes
async function register(email, username, password) {
  if (!await validateRegistration(email, username, password)) {
    return;
  }

  const response = await fetch('/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Registration failed:', error.detail);
    return;
  }

  const data = await response.json();
  console.log('Registration successful!', data.user);
  // Store token
  localStorage.setItem('access_token', data.access_token);
}

function displayErrors(errors) {
  document.getElementById('email-error').textContent = errors.email || '';
  document.getElementById('username-error').textContent = errors.username || '';
  document.getElementById('password-error').textContent = errors.password || '';
}
```

---

## Troubleshooting

### Issue: 422 Unprocessable Entity

**Cause:** Validation error at Pydantic level (email format, etc.)

**Solution:**
1. Use `/validate-registration` endpoint first
2. Check error details in response
3. Fix the field and retry

### Issue: 400 Bad Request from Registration

**Cause:** Email already registered, Supabase constraints, etc.

**Solution:**
1. Check the error message
2. Use a different email if it's "already registered"
3. Ensure password meets Supabase requirements

### Issue: No Clear Error Message

**Solution:**
1. Always validate first: `/api/v1/auth/validate-registration`
2. Fix all validation errors
3. Then attempt registration

---

## Common Valid Examples

### Valid Usernames
- `fahad123`
- `test_user`
- `user-one`
- `john_doe_2025`

### Valid Passwords
- `Password123!`
- `MyP@ssw0rd`
- `Secure#Pass99`
- `TestPass@2025`

### Valid Emails
- `user@example.com`
- `fahad@gmail.com`
- `test.user+tag@domain.co.uk`

---
