# IMMEDIATE FIX FOR 503 ERROR

## What's Happening
Your Vercel backend is crashing on startup because environment variables are missing or incorrect.

---

## Step 1: Verify Vercel Environment Variables (2 minutes)

### Go to:
1. https://vercel.com/dashboard
2. Select your project: `backend-six-gamma-93` (or similar)
3. Click **Settings**
4. Click **Environment Variables**

### Check These Variables Exist:
```
✓ SUPABASE_URL = https://nixiiarwumhbivyqysws.supabase.co
✓ SUPABASE_SERVICE_KEY = eyJhbGc...
✓ SUPABASE_ANON_KEY = eyJhbGc...
✓ SUPABASE_JWT_SECRET = xttr4N8NTznN...
✓ SECRET_KEY = xttr4N8NTznN...
✓ GOOGLE_API_KEY = AIzaSyAolsBUXFOL...
✓ ENVIRONMENT = production
```

**If ANY are missing:** Add them now (copy from `.env` file)

---

## Step 2: Redeploy (1 minute)

```bash
vercel deploy --prod
```

Wait for deployment to complete (~2-3 minutes).

---

## Step 3: Verify It Works (1 minute)

Test these endpoints:

**Test Root:**
```bash
curl https://backend-six-gamma-93.vercel.app/
```

**Test Health:**
```bash
curl https://backend-six-gamma-93.vercel.app/health
```

**If status is "healthy" → FIXED! ✅**

If not → Continue to Step 4

---

## Step 4: Check Logs (2 minutes)

```bash
vercel logs --follow
```

Look for error messages like:
- `SUPABASE_URL is not configured` → Variable missing
- `SUPABASE_SERVICE_KEY is not configured` → Variable missing
- `Failed to initialize database` → Database issue

---

## Step 5: Quick Checklist

- [ ] All 7 env vars are in Vercel settings
- [ ] No typos in variable names
- [ ] No quotes around values
- [ ] Redeployed with `vercel deploy --prod`
- [ ] Waited 2-3 minutes for deployment
- [ ] Health endpoint returns status: "healthy"

---

## Copy-Paste Environment Variables

Get these values from `.env` and paste into Vercel:

```bash
# From your .env file:
SUPABASE_URL
SUPABASE_SERVICE_KEY
SUPABASE_ANON_KEY
SUPABASE_JWT_SECRET
SECRET_KEY
GOOGLE_API_KEY
ENVIRONMENT=production
```

---

## Common Issue: Copy-Paste Errors

❌ Don't do this:
```
SUPABASE_SERVICE_KEY = "eyJhbGc..."  (with quotes)
SUPABASE_URL =https://...            (space missing)
```

✅ Do this:
```
SUPABASE_SERVICE_KEY = eyJhbGc...    (no quotes)
SUPABASE_URL = https://...           (space after =)
```

---

## Expected Result After Fix

```json
{
  "status": "healthy",
  "environment": "production",
  "database": {"status": "connected"},
  "supabase": {"status": "ready"}
}
```

---

## Still 503? Last Resort

1. Check **Vercel Logs** for exact error
2. Share the error message
3. Verify `.env` file has correct values
4. Try different variable names (check for typos)

---

**TL;DR:** Add missing env vars to Vercel → Redeploy → Wait 2-3 min → Test /health endpoint

Most 503 errors are fixed by this! 🚀
