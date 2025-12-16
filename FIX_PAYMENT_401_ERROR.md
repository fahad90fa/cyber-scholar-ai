# Fix: Payment Request 401 (Invalid or Expired Token) Error

## Error Summary

When attempting to create a payment request, the frontend shows:
```
Error: Invalid or expired token
at M6.request (api calls)
```

This means your authentication token is either **expired** or **invalid**.

## Root Causes

### 1. **Token Expiration** ✅ FIXED

**Issue**: JWT tokens have an expiration time (default 30 minutes in code, but .env sets 10000 minutes = 7 days).

**What Was Wrong**:
- Frontend didn't check if token was expired before sending requests
- Backend would reject expired tokens with generic 401 errors

**What's Fixed**:
- Frontend now checks token expiration before requests
- Better error messages telling users to login again
- Backend improved error messages

**File Modified**: `src/services/api.ts`
- Added `isTokenExpired()` method (line 63-84)
- Token expiration check before request (line 51-54)
- Clear token on 401 response (line 141)

### 2. **Improved Error Handling** ✅ FIXED

**Files Modified**:
1. **`src/services/api.ts`**
   - Better 401 error messages (line 140-145)
   - Token expiration detection (line 63-84)
   - Automatic token clearing on auth failure (line 141)

2. **`src/pages/CheckoutPage.tsx`**
   - Improved error catching (line 76-86)
   - Redirect to login on expired token (line 80)
   - Better user feedback (line 83)

3. **`backend/app/security.py`** (from previous fix)
   - Better token validation logging
   - Clearer 401 error messages
   - Token debugging support

## Token Lifecycle

### Generation (Backend)
```python
# backend/.env
ACCESS_TOKEN_EXPIRE_MINUTES=10000  # 7 days
```

### Storage (Frontend)
```typescript
// src/services/api.ts
localStorage.setItem("auth_token", token);  // Stored after login
```

### Usage (Frontend)
```typescript
// Automatically included in all API requests
headers["Authorization"] = `Bearer ${token}`;
```

### Validation (Backend)
```python
# backend/app/security.py
payload = jwt.decode(token, settings.SUPABASE_JWT_SECRET)
# Checks expiration (exp claim)
```

## Debugging Steps

### Step 1: Check if Token is Stored

**In Browser Console**:
```javascript
localStorage.getItem('auth_token');
// Should return a JWT token like: eyJhbGc...
// If returns null, you're not logged in
```

### Step 2: Check Token Expiration

**In Browser Console**:
```javascript
const token = localStorage.getItem('auth_token');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Exp:', new Date(payload.exp * 1000));
console.log('Now:', new Date());
console.log('Expired:', Date.now() > (payload.exp * 1000));
```

### Step 3: Enable Debug Logs

**Browser Console - Look for**:
```
✓ Token is valid until 2025-12-23T...
⚠️  Token is expired (expired at 2025-12-16T...)
```

### Step 4: Test Payment Request

**In Browser Console** (after Step 3 confirms token is valid):
```javascript
// The improved error messages will show:
// "Authentication failed: Invalid or expired token. Please login again."
// or
// "Token expired - please login again"
```

## Quick Fixes

### Fix 1: Login Again (Recommended)
The simplest fix - just login again:
1. Click logout
2. Login with your credentials
3. Try payment request again

### Fix 2: Check Backend Token Expiration Setting

**File**: `backend/.env`

```env
# Check current setting:
ACCESS_TOKEN_EXPIRE_MINUTES=10000

# If you want shorter expiration (for testing):
ACCESS_TOKEN_EXPIRE_MINUTES=60  # 1 hour

# If you want longer expiration (for users):
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days
```

**After changing**:
```bash
# 1. Restart backend
python3 -m uvicorn app.main:app --reload

# 2. Login again to get new token
# 3. Try payment request again
```

### Fix 3: Verify Backend Token Generation

**Test the backend generates valid tokens**:

```bash
# 1. Login and get token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Response: {"access_token": "eyJhbGc...", ...}

# 2. Test the token with /auth/me
TOKEN="eyJhbGc..."  # Copy from step 1
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Should return: {"id": "...", "email": "...", ...}
# If 401, token is invalid or expired
```

## Testing the Fix

### Scenario 1: Expired Token
```
1. Login
2. Wait until token expiration time passes (or manually set clock forward)
3. Try payment request
Expected: "Your session has expired. Please login again." → Redirect to login
```

### Scenario 2: Valid Token
```
1. Login (token valid for 7 days)
2. Try payment request immediately
Expected: Payment request created successfully
```

### Scenario 3: Missing Token
```
1. Clear localStorage: localStorage.clear()
2. Try payment request without logging in
Expected: "Your session has expired. Please login again." → Redirect to login
```

## Configuration for Deployment

### Production (.env in backend)

```env
# Token expiration for production (7 days)
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Supabase must use this for token generation
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=<from Supabase Dashboard>
```

### Vercel Deployment

1. **Add environment variables**:
   ```
   ACCESS_TOKEN_EXPIRE_MINUTES=10080
   SUPABASE_URL=<your url>
   SUPABASE_JWT_SECRET=<your secret>
   ```

2. **Redeploy backend**

3. **Test payment flow**

## Error Reference

| Error | Cause | Solution |
|-------|-------|----------|
| **"Invalid or expired token"** | Token expired (>7 days old) | Login again |
| **"Authentication failed"** | Invalid token format/signature | Login again |
| **"Token expired - please login again"** | Frontend detected expiration | Login again |
| **401 on /payment-requests** | Token not sent or invalid | Check localStorage has auth_token |
| **No error, then 401** | Token became invalid mid-request | Unlikely but login again |

## Monitoring Token Health

### Frontend Console Warnings

Watch for these in the browser console:
```
✓ Token is valid until ...
⚠️  Token expired at ...
⚠️  Token is expired, clearing and rethrowing
Error checking token expiration:...
```

### Backend Logs

Watch for these in backend output:
```
Invalid or expired token
Token missing user identifier
User not found in system
Failed to decode token
```

## Prevention Tips

1. **Session Management**:
   - Clear token on logout
   - Refresh page after login to ensure token is loaded
   - Check token before making payments

2. **User Experience**:
   - Remind users to login before checkout
   - Show token expiration time
   - Auto-logout after expiration

3. **Error Handling**:
   - Catch 401 errors specifically
   - Redirect to login on auth failure
   - Don't require token for public endpoints

## Files Modified

1. **`src/services/api.ts`** - Token expiration checking & better errors
2. **`src/pages/CheckoutPage.tsx`** - Better error handling & UX
3. **`backend/app/security.py`** - Token validation improvements

## Next Steps

1. ✅ Run tests to confirm token handling works
2. ✅ Test payment flow with freshly logged-in user
3. ✅ Monitor browser console for warnings
4. ✅ Deploy to production with updated env vars
5. ✅ Test in production after deployment

---

**Still Having Issues?**
1. Check browser console for token expiration messages
2. Run `localStorage.getItem('auth_token')` - should return a token
3. Decode token payload - check `exp` field
4. Login again and immediately try payment request
5. Check backend logs for validation errors

