# Supabase Setup Guide

This guide explains how to properly set up Supabase for the CyberScholar AI backend.

## Environment Variables Configuration

### Required Supabase Credentials

1. **SUPABASE_URL**
   - Get from: Supabase Dashboard → Settings → API → Project URL
   - Format: `https://your-project.supabase.co`

2. **SUPABASE_SERVICE_KEY** (Backend Only)
   - Get from: Supabase Dashboard → Settings → API → Service role secret key
   - Used for: Backend operations that need to bypass RLS
   - **IMPORTANT**: This is sensitive! Keep it secure.

3. **SUPABASE_ANON_KEY** (Frontend)
   - Get from: Supabase Dashboard → Settings → API → Anon key
   - Used for: Frontend and unauthenticated requests
   - Can be exposed in frontend (it's designed for this)

4. **SUPABASE_JWT_SECRET** (Auth Verification)
   - Get from: Supabase Dashboard → Settings → API → JWT Secret
   - Used for: Verifying JWT tokens from Supabase Auth
   - This is different from SERVICE_KEY or ANON_KEY
   - **IMPORTANT**: This must be set correctly for token verification to work

## How to Get Supabase Credentials

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** (gear icon at bottom left)
4. Click **API** tab
5. You'll see:
   - Project URL → `SUPABASE_URL`
   - Anon key → `SUPABASE_ANON_KEY`
   - Service role secret → `SUPABASE_SERVICE_KEY`
   - JWT Secret → `SUPABASE_JWT_SECRET`

## Setup Steps

### 1. Update Environment Variables

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your Supabase credentials
# Make sure to fill in:
# - SUPABASE_URL
# - SUPABASE_SERVICE_KEY
# - SUPABASE_ANON_KEY
# - SUPABASE_JWT_SECRET
```

### 2. Apply Supabase Migrations

The migrations set up the necessary tables and triggers for auth integration:

```bash
# Option A: Using Supabase CLI
supabase migration up

# Option B: Manual - Via Supabase SQL Editor
# 1. Go to Supabase Dashboard
# 2. SQL Editor → New Query
# 3. Copy contents of: supabase/migrations/001_setup_auth_triggers.sql
# 4. Execute
```

### 3. Configure Auth Settings

In Supabase Dashboard:

1. **Authentication → Providers**
   - Enable "Email" provider
   - Set email as required

2. **Authentication → Email Templates** (Optional)
   - Customize confirmation email if needed

3. **Authentication → URL Configuration**
   - Add allowed redirect URLs:
     - `http://localhost:3000`
     - `http://localhost:5173`
     - `https://cyber-scholar-ai.vercel.app`

## Common Issues and Solutions

### Issue 1: 401 Invalid Credentials

**Cause**: JWT token verification fails because SUPABASE_JWT_SECRET is incorrect

**Solution**:
1. Verify SUPABASE_JWT_SECRET is set correctly
2. Don't use SERVICE_KEY as JWT_SECRET
3. Check Supabase Dashboard → Settings → API → JWT Secret

### Issue 2: 400 Null Email in Profiles Table

**Cause**: Profile table doesn't have email field or triggers aren't working

**Solution**:
1. Run the migrations: `supabase migration up`
2. Verify profiles table exists: `SELECT * FROM profiles LIMIT 1;`
3. Check triggers exist: `SELECT * FROM pg_triggers WHERE tgname LIKE 'on_auth%';`

### Issue 3: Profile Not Created on User Registration

**Cause**: Auth trigger not firing

**Solution**:
1. Manually create profile via API (already implemented as fallback)
2. Check Supabase function logs
3. Verify trigger permissions

## Testing

### Test Auth Flow

```bash
# Register a new user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!","username":"testuser"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Verify profile was created
curl http://localhost:8000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Verify Database

```bash
# Check users in Supabase
SELECT * FROM auth.users;

# Check profiles
SELECT id, email, username FROM profiles;

# Check auth triggers
SELECT * FROM pg_triggers WHERE tgname LIKE 'on_auth%';
```

## Deployment to Vercel

1. Add environment variables to Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY` (use service_role key for backend)
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_JWT_SECRET`

2. Ensure migrations are applied to your Supabase project

3. Verify connectivity:
   ```bash
   # After deployment, check logs:
   vercel logs
   ```

## Security Notes

- **SERVICE_KEY**: Backend only, never expose to frontend
- **ANON_KEY**: Can be in frontend, limited by RLS policies
- **JWT_SECRET**: Used for verification, must be exact match
- Always use HTTPS in production
- Enable RLS on all tables with appropriate policies
- Regularly rotate secrets in production

## Need More Help?

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth/overview)
- [Supabase Database](https://supabase.com/docs/guides/database/overview)
