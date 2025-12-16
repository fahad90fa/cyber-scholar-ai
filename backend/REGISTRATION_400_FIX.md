# Fix 400 (Bad Request) Error in `/api/v1/auth/register`

## Issue
The registration endpoint returns **400 Bad Request** when validation fails, with unclear error messages.

## Root Causes
The `ValidatedUserCreate` Pydantic model enforces strict validation:

### 1. **Email Validation**
- Must be a valid email format
- Example: `fahad@example.com` ✅
- Invalid: `fahad` or `fahad@` ❌

### 2. **Username Validation**
- Pattern: `^[a-zA-Z0-9_-]{3,32}$`
- Must be 3-32 characters
- Only letters, numbers, underscores (`_`), hyphens (`-`)
- Examples:
  - ✅ `fahad123`, `test_user`, `user-one`
  - ❌ `ab` (too short), `user@name` (invalid char), `user@gmail.com` (email not username)

### 3. **Password Validation**
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 digit (0-9)
- At least 1 special character: `!@#$%^&*(),.?":{}|<>`
- Examples:
  - ✅ `Password123!`, `Test@1234`, `MyPass!99`
  - ❌ `password123` (no uppercase or special), `ABC123!` (no lowercase)

---

## CORRECT Request Payload

```javascript
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "fahad@example.com",     // Valid email
  "username": "fahad123",            // 3-32 chars, alphanumeric + _ or -
  "password": "Password123!"         // 8+ chars, upper+lower+digit+special
}
```

---

## Fix 1: Improve Error Messages

**---FILE: app/validators.py---**

```python
from pydantic import field_validator, BaseModel, EmailStr, ValidationError
import re
import html

class ValidatedUserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        if not v or len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if len(v) > 32:
            raise ValueError("Username must not exceed 32 characters")
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError("Username can only contain letters, numbers, underscores, or hyphens")
        return v
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        errors = []
        
        if len(v) < 8:
            errors.append("at least 8 characters")
        if not re.search(r'[A-Z]', v):
            errors.append("at least one uppercase letter")
        if not re.search(r'[a-z]', v):
            errors.append("at least one lowercase letter")
        if not re.search(r'[0-9]', v):
            errors.append("at least one digit")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            errors.append("at least one special character: !@#$%^&*(),.?\"{}<>|")
        
        if errors:
            msg = "Password must contain " + " and ".join(errors)
            raise ValueError(msg)
        
        return v
```

---

## Fix 2: Better Error Handling in Auth Endpoint

**---FILE: app/api/routes/auth.py---**

```python
from pydantic import ValidationError

@router.post("/register", response_model=schemas.TokenResponse)
async def register(user_data: ValidatedUserCreate, db: Session = Depends(get_db)):
    # Validation errors from Pydantic will be caught automatically
    # FastAPI returns detailed 422 Unprocessable Entity with validation details
    
    # Double-check email format (extra safety)
    if not EmailValidator.validate_email(user_data.email):
        logger.warning(f"Invalid email format attempted: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format. Use: example@domain.com"
        )
    
    try:
        try:
            supabase_user = supabase.auth.sign_up({
                "email": user_data.email.lower(),
                "password": user_data.password
            })
        except Exception as auth_err:
            error_detail = str(auth_err).lower()
            if "already registered" in error_detail or "user already exists" in error_detail:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This email is already registered. Please login instead."
                )
            if "password" in error_detail:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password does not meet Supabase requirements"
                )
            logger.warning(f"Supabase auth sign_up failed: {str(auth_err)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration failed. Please try again."
            )
        
        if not supabase_user.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email is already registered"
            )
        
        # ... rest of registration logic
```

---

## Fix 3: Add Validation Test Endpoint (Optional)

**---FILE: app/api/routes/auth.py---** (add this endpoint)

```python
from pydantic import ValidationError, BaseModel

class RegistrationTest(BaseModel):
    email: str = ""
    username: str = ""
    password: str = ""

@router.post("/validate-registration")
async def validate_registration(data: RegistrationTest):
    """
    Test endpoint to validate registration data without actually registering.
    Useful for debugging 400 errors.
    """
    errors = {}
    
    # Email validation
    if not data.email:
        errors["email"] = "Email is required"
    elif not EmailValidator.validate_email(data.email):
        errors["email"] = "Invalid email format. Use: example@domain.com"
    
    # Username validation
    if not data.username:
        errors["username"] = "Username is required"
    elif len(data.username) < 3:
        errors["username"] = "Username must be at least 3 characters"
    elif len(data.username) > 32:
        errors["username"] = "Username must not exceed 32 characters"
    elif not re.match(r'^[a-zA-Z0-9_-]+$', data.username):
        errors["username"] = "Username can only contain letters, numbers, underscores, or hyphens"
    
    # Password validation
    if not data.password:
        errors["password"] = "Password is required"
    else:
        is_valid, message = PasswordValidator.validate_password(data.password)
        if not is_valid:
            errors["password"] = message
    
    if errors:
        return {
            "valid": False,
            "errors": errors
        }
    
    return {
        "valid": True,
        "message": "Registration data is valid. You can proceed with registration."
    }
```

---

## Testing

### Test 1: Validate Request Before Registration

```bash
# Test validation endpoint first
curl -X POST http://localhost:8000/api/v1/auth/validate-registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fahad@example.com",
    "username": "fahad123",
    "password": "Password123!"
  }'

# Expected response:
{
  "valid": true,
  "message": "Registration data is valid. You can proceed with registration."
}
```

### Test 2: Test with Invalid Data

```bash
# Test with invalid username
curl -X POST http://localhost:8000/api/v1/auth/validate-registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fahad@example.com",
    "username": "fa",
    "password": "Password123!"
  }'

# Expected response:
{
  "valid": false,
  "errors": {
    "username": "Username must be at least 3 characters"
  }
}
```

### Test 3: Register with Valid Data

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fahad@example.com",
    "username": "fahad123",
    "password": "Password123!"
  }'

# Expected response (200 OK):
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "...",
    "email": "fahad@example.com",
    "username": "fahad123",
    "is_active": true,
    "created_at": "2025-12-16T09:00:00"
  }
}
```

---

## Common 400 Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `400 Bad Request` | Email missing or invalid | Provide valid email: `user@domain.com` |
| `400 Bad Request` | Username too short | Use 3+ characters: `fahad123` |
| `400 Bad Request` | Username has invalid chars | Use only letters, numbers, `_`, `-` |
| `400 Bad Request` | Password missing uppercase | Add at least 1 uppercase: `Password123!` |
| `400 Bad Request` | Password missing digit | Add at least 1 number: `Password123!` |
| `400 Bad Request` | Password missing special char | Add special char: `!@#$%^&*` |
| `400 Bad Request` | Email already registered | Use different email or login |

---

## Validation Rules Summary

| Field | Rule | Valid | Invalid |
|-------|------|-------|---------|
| **email** | Valid email format | `fahad@example.com` | `fahad`, `@example.com` |
| **username** | 3-32 chars, `[a-zA-Z0-9_-]` | `fahad_123`, `user-one` | `fa`, `user@email` |
| **password** | 8+ chars, upper+lower+digit+special | `Pwd@123abc` | `password123`, `PASSWORD!` |

---

## References

- **Pydantic Validation**: https://docs.pydantic.dev/latest/concepts/validators/
- **FastAPI Error Handling**: https://fastapi.tiangolo.com/tutorial/handling-errors/
- **Regular Expressions**: https://regex101.com/
