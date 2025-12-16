# Fix: 401 (Unauthorized) Error in `/api/v1/auth/me`

## Problem Summary

The `/api/v1/auth/me` endpoint returns 401 Unauthorized when valid authentication tokens are provided. This is typically caused by token validation failures.

## Root Causes & Solutions

### 1. **Incorrect Token Decoding Priority** ✅ FIXED

**Issue**: The backend tries multiple token validation strategies in the wrong order, causing valid Supabase tokens to be rejected.

**What Was Wrong** (in `security.py`):
```python
# OLD: Tries local SECRET_KEY first, then SUPABASE_JWT_SECRET
payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])  # ❌ Wrong order
payload = jwt.decode(token, settings.SUPABASE_JWT_SECRET, algorithms=["HS256"])    # Only fallback
```

**Fix Applied**:
```python
# NEW: Tries SUPABASE_JWT_SECRET first (from Supabase auth)
payload = jwt.decode(token, settings.SUPABASE_JWT_SECRET, algorithms=["HS256"])
if fails:
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
```

**File Modified**: `backend/app/security.py` (lines 39-62)

### 2. **Improved Error Messages** ✅ FIXED

**Issue**: Generic error messages don't help identify the actual problem.

**What Changed** (in `security.py` lines 65-139):
- ✅ Clearer 401 messages with context
- ✅ Better logging for debugging
- ✅ WWW-Authenticate headers included
- ✅ Null credential checks

**File Modified**: `backend/app/security.py` (lines 65-139)

### 3. **Configuration Requirements** ⚠️ CHECK YOUR .ENV

**Critical**: These environment variables MUST be set correctly:

```env
SUPABASE_JWT_SECRET=xttr4N8NTznN/7+Iau9WtAxA1eOtRncAI26keQx2mr8c3jvaR0iUF7lS26LK/x4bUB2MHvbVV3u39AzOPJADnQ==
SUPABASE_URL=https://nixiiarwumhbivyqysws.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to Verify**:
```bash
# 1. Get SUPABASE_JWT_SECRET from:
#    Supabase Dashboard → Settings → API → JWT Secret (NOT the service key!)

# 2. Check current config:
python3 DEBUG_AUTH.py

# 3. If you see a warning, update .env with correct JWT_SECRET
```

## Testing the Fix

### Step 1: Debug Your Configuration

```bash
cd backend
python3 DEBUG_AUTH.py
```

**Expected Output**:
- ✓ Configuration loaded successfully
- ✓ SUPABASE_JWT_SECRET is set
- ✓ Token decoded successfully

**If You See Warnings**:
- Update your `.env` file with correct values from Supabase Dashboard
- Restart the backend: `python3 -m uvicorn app.main:app --reload`

### Step 2: Test Registration & Login

```bash
# 1. Register a user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Password123!",
    "username":"testuser"
  }'

# Response should include access_token:
# {
#   "access_token": "eyJhbGc...",
#   "token_type": "bearer",
#   "user": {...}
# }

# Copy the access_token value
```

### Step 3: Test `/api/v1/auth/me` Endpoint

```bash
# Replace YOUR_TOKEN with the access_token from step 2
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response (200 OK):
# {
#   "id": "user-id-here",
#   "email": "test@example.com",
#   "username": "testuser",
#   "is_active": true,
#   "created_at": "2025-12-16T..."
# }
```

### Step 4: Debug a Specific Token

If you still get 401, debug the token:

```bash
python3 DEBUG_AUTH.py --token YOUR_TOKEN

# This will show:
# - Token expiration status
# - User ID (sub claim)
# - Email from token
# - Any decoding errors
```

## Frontend Changes (if using custom auth)

If your frontend uses the FastAPI backend directly (not Supabase SDK):

### Store Token After Login

```typescript
// src/services/api.ts is already correct
// It stores the token in localStorage:

const response = await apiClient.post("/auth/login", { email, password });
apiClient.setToken(response.access_token);  // ✓ Already implemented
```

### Send Token in Requests

```typescript
// The ApiClient already includes Authorization header:
private getHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (includeAuth) {
    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;  // ✓ Already correct
    }
  }
  return headers;
}
```

## CORS Configuration ✓ VERIFIED

The backend already has proper CORS setup in `app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,           # ✓ Required for auth headers
    allow_methods=["*"],
    allow_headers=["*"],              # ✓ Includes Authorization
    expose_headers=["Content-Type", "Authorization"],
)
```

## Deployment Checklist

Before deploying to production, ensure:

- [ ] **Supabase Project Created**: Go to supabase.com
- [ ] **JWT Secret Obtained**: Supabase Dashboard → Settings → API → JWT Secret
- [ ] **Environment Variables Set in Vercel**:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY` (service role key)
  - `SUPABASE_JWT_SECRET` (NOT the same as service key!)
  - Other required vars (GEMINI_API_KEY, etc.)
- [ ] **Migrations Applied**: Run Supabase migrations in your project
- [ ] **Email Confirmation Disabled** (for development): Supabase → Auth → Settings

## Quick Reference: Common Errors & Fixes

| Error | Cause | Solution |
|-------|-------|----------|
| **401 Invalid token** | SUPABASE_JWT_SECRET wrong | Update .env, verify from Supabase Dashboard |
| **401 Invalid credentials** | Token expired (1 hour default) | Login again to get new token |
| **401 User not found** | User doesn't exist in DB | Ensure registration creates profile |
| **Invalid host header** | TrustedHostMiddleware blocking | Add domain to ALLOWED_ORIGINS in .env |
| **CORS error** | Missing Authorization header support | Already fixed in middleware config |

## Files Modified

1. **`backend/app/security.py`**
   - Fixed `decode_token()` priority (SUPABASE_JWT_SECRET first)
   - Improved `get_current_user()` error handling
   - Added better logging and messages

2. **`backend/DEBUG_AUTH.py`** (New)
   - Configuration verification script
   - Token decoding tester
   - Debugging helper

## Next Steps

1. Run `python3 DEBUG_AUTH.py` to verify your setup
2. Follow the "Testing the Fix" section above
3. If still getting 401, share the output of `DEBUG_AUTH.py --token <your_token>`
4. Deploy to Vercel with updated environment variables

---

**Still Having Issues?** Check:
- Backend logs: Look for "Invalid or expired token" messages
- Supabase logs: Check if auth.users table has your user
- Token validity: Run `DEBUG_AUTH.py --token <your_token>`
- Environment: Verify all 4 Supabase credentials are correct
