# Fix 406 Not Acceptable Error - Onboarding Status

## Problem
Getting 406 (Not Acceptable) error when fetching onboarding status:
```
GET https://nixiiarwumhbivyqysws.supabase.co/rest/v1/profiles?select=onboarding_completed&id=eq.xxx 406
```

## Root Causes
1. `onboarding_completed` column missing from profiles table
2. RLS policies blocking SELECT on the column
3. Policy syntax issues preventing query execution

## Solution

### Step 1: Run This SQL in Supabase Dashboard

Go to **Supabase Console** → **SQL Editor** → Create new query → Paste and run:

```sql
-- ============================================================================
-- COMPREHENSIVE FIX FOR ONBOARDING_COMPLETED COLUMN AND RLS POLICIES
-- ============================================================================

-- Step 1: Ensure the column exists
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Step 2: Drop all existing RLS policies to start fresh
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Step 3: Enable RLS (make sure it's enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create clear, working RLS policies
-- Policy 1: Authenticated users can SELECT their own profile (including onboarding_completed)
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Authenticated users can UPDATE their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Authenticated users can INSERT their own profile
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 4: Service role (server/functions) can do anything
CREATE POLICY "profiles_service_role"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON public.profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);
```

### Step 2: Verify the Fix Works

After running the SQL above, test with this query in Supabase SQL Editor:

```sql
-- Test SELECT query
SELECT id, onboarding_completed FROM public.profiles LIMIT 1;
```

Expected result: A row with `id` and `onboarding_completed` (true or false).

### Step 3: Clear App Cache and Test

1. **Clear Browser Cache**
   - Chrome: Ctrl+Shift+Delete
   - Safari: Cmd+Shift+Delete
   - Firefox: Ctrl+Shift+Delete

2. **Hard Refresh**
   - Chrome/Firefox: Ctrl+F5
   - Safari: Cmd+Shift+R

3. **Log Out and Back In**

4. **Test Onboarding**
   - Go to `/onboarding`
   - Complete the steps
   - Should see no 406 errors
   - Should redirect to dashboard

### Step 4: Check Browser Console

After testing, check the browser console (F12) for logs:

```
[Onboarding] Fetching status for user: 983d648a-bc79-4ca9-aaa5-66bae1a97ccb
[Onboarding] Status fetched: false
```

If you see errors, report them below.

## Debugging

### If Still Getting 406 Error

Check these in Supabase Console:

**1. Verify column exists:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'onboarding_completed';
```
Should return: `onboarding_completed`

**2. Check RLS is enabled:**
```sql
SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles';
```
Should return: `t` (true)

**3. Verify RLS policies:**
```sql
SELECT policyname, qual, with_check FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;
```
Should show policies like:
- `profiles_select_own`
- `profiles_update_own`
- `profiles_insert_own`
- `profiles_service_role`

**4. Test RLS permission directly:**
```sql
-- This simulates what the app does
SET request.jwt.claims = '{"sub":"983d648a-bc79-4ca9-aaa5-66bae1a97ccb"}';
SELECT onboarding_completed FROM public.profiles WHERE id = '983d648a-bc79-4ca9-aaa5-66bae1a97ccb';
```

## Code Changes Made

1. **Updated `src/hooks/useOnboardingStatus.ts`**
   - Added detailed console logging for debugging
   - Improved error handling
   - Added retry logic
   - Fixed query parameters

2. **Created migration files:**
   - `supabase/migrations/20250209_fix_profiles_rls_update.sql`
   - `supabase/migrations/20250209b_ensure_onboarding_columns.sql`
   - `supabase/migrations/20250210_comprehensive_onboarding_fix.sql`

## Files Modified

```
src/hooks/useOnboardingStatus.ts - Updated with better error handling
supabase/migrations/20250210_comprehensive_onboarding_fix.sql - Complete fix
```

## Environment Variables Check

Make sure these are set in `.env.local`:

```
VITE_SUPABASE_URL=https://nixiiarwumhbivyqysws.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_key_here
```

Verify by checking `src/integrations/supabase/client.ts`:
- It should use `VITE_SUPABASE_URL` environment variable
- It should have `persistSession: true` in auth config

## Next Steps

1. Apply the SQL fix above
2. Clear browser cache and hard refresh
3. Check console logs for `[Onboarding]` messages
4. Test onboarding completion
5. If still issues, check the debugging section above

## Support

If issues persist:
1. Share browser console output (F12)
2. Check Supabase function logs
3. Verify user exists in `auth.users` table
4. Verify profile exists in `public.profiles` table
