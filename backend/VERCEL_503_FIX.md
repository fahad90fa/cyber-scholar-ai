# Fix 503 Service Unavailable on Vercel

## Issue
Backend is returning 503 (Service Unavailable) when deployed on Vercel.

## Common Causes
1. **Missing Environment Variables** on Vercel
2. **Supabase Not Initialized** (missing credentials)
3. **Database Connection Failing** (DATABASE_URL issue)
4. **Startup Errors** (silent failures)

---

## Diagnostic Steps

### Step 1: Check Health Endpoint
```bash
curl https://backend-six-gamma-93.vercel.app/health
```

**Expected (Healthy):**
```json
{
  "status": "healthy",
  "timestamp": "...",
  "environment": "production",
  "database": {"status": "connected", "url_scheme": "sqlite"},
  "supabase": {"status": "ready"}
}
```

**If Degraded or Error:** Check individual components below

### Step 2: Verify Environment Variables on Vercel

Go to **Vercel Dashboard → Project Settings → Environment Variables**

Required variables:
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_KEY`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `SUPABASE_JWT_SECRET`
- ✅ `SECRET_KEY`
- ✅ `GOOGLE_API_KEY`
- ✅ `DATABASE_URL` (optional, defaults to SQLite)
- ✅ `ENVIRONMENT=production`

**If Missing:** Add them immediately and redeploy

### Step 3: Check Vercel Logs
```bash
vercel logs
# or
vercel logs --follow
```

Look for errors like:
- `SUPABASE_URL is not configured`
- `SUPABASE_SERVICE_KEY is not configured`
- `Database initialization error`

### Step 4: Test Root Endpoint
```bash
curl https://backend-six-gamma-93.vercel.app/
```

Should return:
```json
{
  "message": "Welcome to CyberScholar AI",
  "docs": "/docs",
  "api_version": "/api/v1"
}
```

If this fails → Backend is not starting

---

## Fix Options

### Option A: Add Missing Environment Variables

1. Go to **Vercel Dashboard**
2. Select your project
3. **Settings → Environment Variables**
4. Add all required variables:

```
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_SERVICE_KEY = eyJhbGc...
SUPABASE_ANON_KEY = eyJhbGc...
SUPABASE_JWT_SECRET = your_jwt_secret
SECRET_KEY = your_secret_key
GOOGLE_API_KEY = your_google_key
ENVIRONMENT = production
```

5. **Save and Redeploy:**
```bash
vercel deploy --prod
```

### Option B: Fix Supabase Configuration

If `SUPABASE_URL` or keys are missing:

1. Get credentials from **Supabase Dashboard → Settings → API**
2. Copy exact values (no spaces, no quotes)
3. Add to Vercel environment
4. Redeploy

### Option C: Fix DATABASE_URL (if needed)

If using external database:
```
DATABASE_URL = postgresql://user:password@host:5432/dbname
# or
DATABASE_URL = sqlite:////tmp/cyber_scholar.db
```

### Option D: Enable Vercel Logs

Add to `vercel.json`:
```json
{
  "buildCommand": "pip install -r requirements.txt",
  "env": {
    "PYTHONUNBUFFERED": "1"
  },
  "logs": {
    "enabled": true
  }
}
```

---

## Deployment Checklist

- [ ] All 4 Supabase env vars added to Vercel
- [ ] ENVIRONMENT set to `production`
- [ ] SECRET_KEY configured
- [ ] GOOGLE_API_KEY configured
- [ ] Health endpoint returns 200
- [ ] Root endpoint returns welcome message
- [ ] Login endpoint accessible

---

## Testing After Deploy

### Test 1: Health Check
```bash
curl https://backend-six-gamma-93.vercel.app/health
```

Should return status: `healthy`

### Test 2: Root Endpoint
```bash
curl https://backend-six-gamma-93.vercel.app/
```

Should return welcome message

### Test 3: Validation Endpoint
```bash
curl -X POST https://backend-six-gamma-93.vercel.app/api/v1/auth/validate-registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123!"
  }'
```

Should return validation result

### Test 4: Login Endpoint
```bash
curl -X POST https://backend-six-gamma-93.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

Should work if user exists

---

## Common Issues & Solutions

| Symptom | Cause | Solution |
|---------|-------|----------|
| 503 Service Unavailable | Missing env vars | Add vars to Vercel |
| Health check degraded | Supabase not init | Verify SUPABASE_URL |
| Database error | Wrong DATABASE_URL | Use SQLite or PostgreSQL URL |
| SUPABASE_URL not configured | Env var not set | Add to Vercel settings |
| Silent failures | No logs visible | Use `vercel logs` |

---

## Quick Fix Script

If you're unsure what's missing, copy `.env` values to Vercel:

```bash
# Read from .env and print for Vercel
cat .env | grep -E "SUPABASE|SECRET|GOOGLE|DATABASE|ENVIRONMENT"

# Add each to Vercel dashboard manually
```

---

## Vercel Deployment Commands

```bash
# Preview deployment
vercel deploy

# Production deployment
vercel deploy --prod

# Check logs
vercel logs

# Set environment variable
vercel env add SUPABASE_URL

# Redeploy with new env
vercel deploy --prod
```

---

## Still 503? Try This

1. **Check Vercel logs:**
   ```bash
   vercel logs --follow
   ```

2. **Look for error messages** (will show what's failing)

3. **Common errors:**
   - `SUPABASE_URL is not configured` → Add to Vercel
   - `SUPABASE_SERVICE_KEY is not configured` → Add to Vercel
   - `Cannot connect to database` → Check DATABASE_URL
   - `Failed to initialize database` → Check .env file syntax

4. **If error not clear:**
   - Redeploy: `vercel deploy --prod`
   - Wait 1-2 minutes for new deployment
   - Try again

---

## Contact Vercel Support

If still failing after all steps:
- Include health check response
- Include full logs from `vercel logs`
- Include environment variables (hide secrets)
- Include error messages

---

## Next Steps

1. Add env vars to Vercel
2. Redeploy: `vercel deploy --prod`
3. Test health: `curl .../health`
4. Monitor logs: `vercel logs --follow`
5. Test endpoints

All fixes should resolve 503 error! 🚀
