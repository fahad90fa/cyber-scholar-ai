# Fix 406 Error - Missing Profile Issue

## ✅ ACTUAL PROBLEM IDENTIFIED

The 406 error occurs because:
```
Profile does not exist in public.profiles table for user ID: e08a32ef-48d6-44df-bd86-3c39644921fb
```

Error details:
```
PGRST116: Cannot coerce the result to a single JSON object
Cannot find profile with 0 rows returned
```

## Root Cause

When user signs up:
1. User is created in `auth.users` table ✅
2. Profile SHOULD be created in `public.profiles` table ❌ **NOT HAPPENING**

The profile creation is supposed to happen via:
- **Trigger** `handle_new_user()` on `auth.users` INSERT, OR
- **API call** `/auth/init-profile` after signup

If either fails, profile doesn't exist → 406 error.

## Solution

### ✅ Code Fix Applied

**File:** `src/hooks/useOnboardingStatus.ts`

Changed from `.single()` (throws error if 0 rows) to `.maybeSingle()` (returns null if 0 rows):

```typescript
// OLD - Throws error if profile doesn't exist
const { data, error } = await supabase
  .from('profiles')
  .select('onboarding_completed')
  .eq('id', user.id)
  .single(); // ❌ Throws PGRST116 error

// NEW - Returns null if profile doesn't exist, then creates it
const { data, error } = await supabase
  .from('profiles')
  .select('onboarding_completed')
  .eq('id', user.id)
  .maybeSingle(); // ✅ Returns null, no error

// If profile doesn't exist, auto-create it
if (!data) {
  console.warn('[Onboarding] Profile not found, attempting to create...');
  const { data: newProfile, error: createError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      onboarding_completed: false,
    })
    .select()
    .single();
}
```

## How to Test

### Step 1: Apply Database Migration

Go to **Supabase Dashboard → SQL Editor → New Query** and run:

```sql
-- Ensure columns exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Drop conflicting policies
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

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_service_role"
  ON public.profiles FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON public.profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);
```

### Step 2: Create Profiles for Existing Users

For the user `e08a32ef-48d6-44df-bd86-3c39644921fb` that already exists, run:

```sql
-- Check if profile exists
SELECT * FROM public.profiles WHERE id = 'e08a32ef-48d6-44df-bd86-3c39644921fb';

-- If empty, create it
INSERT INTO public.profiles (id, onboarding_completed)
VALUES ('e08a32ef-48d6-44df-bd86-3c39644921fb', false)
ON CONFLICT (id) DO NOTHING;
```

### Step 3: Clear Cache & Test

```bash
# Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
# Hard refresh (Ctrl+F5 or Cmd+Shift+R)
# Check browser console (F12)
```

Expected console logs:
```
[Onboarding] Fetching status for user: e08a32ef-48d6-44df-bd86-3c39644921fb
[Onboarding] Status fetched: false
// OR if profile didn't exist:
[Onboarding] Profile not found for user, attempting to create...
[Onboarding] Profile created successfully
```

### Step 4: Test Without Errors

- No 406 errors in console
- Onboarding redirects correctly
- Dashboard shows onboarding banner
- Can complete onboarding without errors

## Verification Queries

Run these in Supabase SQL Editor to verify:

```sql
-- 1. Check if problematic user exists in auth
SELECT id, email FROM auth.users WHERE id = 'e08a32ef-48d6-44df-bd86-3c39644921fb';

-- 2. Check if profile exists
SELECT * FROM public.profiles WHERE id = 'e08a32ef-48d6-44df-bd86-3c39644921fb';

-- 3. Check RLS policies
SELECT policyname, permissive, roles, qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 4. Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- 5. Test profile creation (as authenticated user)
SET request.jwt.claims = '{"sub":"e08a32ef-48d6-44df-bd86-3c39644921fb"}';
INSERT INTO public.profiles (id, onboarding_completed) 
VALUES ('e08a32ef-48d6-44df-bd86-3c39644921fb', false)
ON CONFLICT (id) DO NOTHING;
SELECT onboarding_completed FROM public.profiles WHERE id = 'e08a32ef-48d6-44df-bd86-3c39644921fb';
```

## Files Modified

```
✅ src/hooks/useOnboardingStatus.ts       Updated - Auto-create profile if missing
✅ src/components/auth/OnboardingGuard.tsx Updated - Better logging
```

## Why This Happens

Profile creation can fail due to:
1. **Trigger not working** - `handle_new_user()` trigger might be broken
2. **API endpoint missing** - `/auth/init-profile` might not exist
3. **Race condition** - App tries to access profile before it's created
4. **RLS policy issue** - Profile can't be created due to RLS restrictions
5. **Database constraint** - Foreign key or unique constraint violation

## Prevention Going Forward

To prevent this in the future:

1. **Ensure trigger is working:**
   ```sql
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.profiles (id, onboarding_completed)
     VALUES (new.id, false)
     ON CONFLICT (id) DO UPDATE SET
       updated_at = NOW();
     RETURN new;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

2. **Or implement `/auth/init-profile` endpoint** in your backend to explicitly create profiles

3. **Or use our auto-create hook logic** - The updated hook will automatically create profiles if missing

## Summary

- ✅ Root cause: **Profile doesn't exist in database**
- ✅ Immediate fix: **Use .maybeSingle() and auto-create profile**
- ✅ Applied in: **useOnboardingStatus.ts**
- ⏳ Required action: **Apply SQL migration**
- ⏳ Optional action: **Manually create profiles for existing users**

Once migration is applied and cache is cleared, the 406 error should be gone!
