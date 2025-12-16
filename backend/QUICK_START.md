# Quick Start - Auth Fixes

## 3-Minute Setup

### 1. Copy Environment Variables
```bash
cp .env.example .env

# Edit .env and add Supabase credentials:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_KEY=your_service_role_key
# SUPABASE_ANON_KEY=your_anon_key
# SUPABASE_JWT_SECRET=your_jwt_secret
```

### 2. Apply Database Migration
```bash
# Option A: CLI
supabase migration up

# Option B: Manual (Supabase SQL Editor)
# Copy contents of: supabase/migrations/001_setup_auth_triggers.sql
# Paste into SQL Editor and execute
```

### 3. Restart Backend
```bash
python -m uvicorn app.main:app --reload
```

---

## Test Registration

### Step 1: Validate Data
```bash
curl -X POST http://localhost:8000/api/v1/auth/validate-registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123!"
  }'
```

**Expected:** `{ "valid": true, "message": "..." }`

### Step 2: Register
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123!"
  }'
```

**Expected:** `{ "access_token": "...", "user": {...} }`

### Step 3: Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

**Expected:** `{ "access_token": "...", "user": {...} }`

---

## Validation Rules

### Email
- Format: `user@domain.com`
- Error: Invalid email format

### Username
- Length: 3-32 characters
- Characters: Letters, numbers, underscore, hyphen
- Error: Check length and characters

### Password
- Length: 8+ characters
- Must have: Uppercase, lowercase, digit, special character
- Error: Check all requirements

---

## Deployment

### Vercel Environment Variables
Add these to your Vercel project:
```
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=...
SUPABASE_ANON_KEY=...
SUPABASE_JWT_SECRET=...
```

### Deploy
```bash
vercel deploy --prod
```

---

## Troubleshooting

### 401 Invalid Credentials
- Check: SUPABASE_JWT_SECRET is set correctly
- Verify: User exists in Supabase Auth dashboard

### 400 Null Email
- Check: Migration was applied
- Verify: Triggers exist in Supabase

### 400 Bad Request on Register
- Use: `/validate-registration` endpoint first
- Check: Email format, username length, password complexity

### 422 Unprocessable Entity
- Problem: Pydantic validation failed
- Solution: Check response details, fix data format

---

## New Endpoints

### Validation Endpoint (New!)
```
POST /api/v1/auth/validate-registration

Request:
{
  "email": "test@example.com",
  "username": "testuser",
  "password": "Password123!"
}

Response:
{
  "valid": true/false,
  "message": "...",  // If valid
  "errors": {...}    // If invalid
}
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| SUPABASE_SETUP.md | Configure Supabase |
| TESTING_REGISTRATION.md | Test cases & examples |
| REGISTRATION_400_FIXES.md | Registration fixes |
| CLAUDE.md | Development commands |
| ALL_FIXES_SUMMARY.md | Complete summary |

---

## Key Files Changed

- `app/api/routes/auth.py` - Better validation & errors
- `app/validators.py` - Detailed error messages
- `app/api/routes/chat_security.py` - Security fix
- `supabase/migrations/001_setup_auth_triggers.sql` - Database schema

---

## Common Valid Values

**Email:**
- test@example.com
- user+tag@domain.co.uk

**Username:**
- testuser
- test_user
- user-123

**Password:**
- Password123!
- MyP@ssw0rd
- Secure#Pass99

---

## One Command to Test All

```bash
# Validate
curl -X POST http://localhost:8000/api/v1/auth/validate-registration \
  -H "Content-Type: application/json" \
  -d '{"email":"fahad@test.com","username":"fahad123","password":"Password123!"}' && \

# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"fahad@test.com","username":"fahad123","password":"Password123!"}' && \

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"fahad@test.com","password":"Password123!"}'
```

---

## Done!

All auth issues are fixed. Your backend is ready to use. 🎉

For detailed information, see `ALL_FIXES_SUMMARY.md`
