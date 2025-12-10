# Onboarding 406 Error Fix - Complete Checklist

## Issue
```
GET https://nixiiarwumhbivyqysws.supabase.co/rest/v1/profiles?select=onboarding_completed&id=eq.xxx 406 (Not Acceptable)
```

## Root Cause
1. ❌ `onboarding_completed` column might not exist in database
2. ❌ RLS policies blocking SELECT operations
3. ❌ RLS policy syntax missing WITH CHECK clause

## Changes Made

### ✅ Code Updates
- **`src/hooks/useOnboardingStatus.ts`** - Enhanced hook with:
  - Better error handling and logging
  - Retry logic (2 retries)
  - Detailed console logs for debugging
  - Proper Supabase client usage (NOT raw fetch)
  - Realtime subscription setup

- **`src/components/auth/OnboardingGuard.tsx`** - Route protection
  - Blocks AI routes until onboarding completed
  - Redirects to `/onboarding` when needed

- **`src/pages/Dashboard.tsx`** - Dashboard with onboarding banner
  - Shows feature cards with lock status
  - Displays onboarding prompt banner
  - Shows subscription status

- **`src/services/chatSecurityService.ts`** - Already has `completeOnboarding()` method
  - Updates `onboarding_completed = true`
  - Sets `onboarding_completed_at` timestamp

- **`supabase/functions/chat/index.ts`** - Backend check
  - Verifies `onboarding_completed` before allowing messages
  - Returns 403 error if not completed

### ✅ Database Migrations

**File:** `supabase/migrations/20250210_comprehensive_onboarding_fix.sql`

What it does:
1. ✅ Ensures `onboarding_completed` BOOLEAN column exists
2. ✅ Ensures `onboarding_completed_at` TIMESTAMPTZ column exists
3. ✅ Drops all old/conflicting RLS policies
4. ✅ Creates 4 clean RLS policies:
   - `profiles_select_own` - Users can SELECT their own profile
   - `profiles_update_own` - Users can UPDATE their own profile
   - `profiles_insert_own` - Users can INSERT their own profile
   - `profiles_service_role` - Service role can do anything
5. ✅ Creates performance indexes

## IMMEDIATE ACTION REQUIRED

### Step 1: Apply Database Migration

**Go to Supabase Dashboard:**
1. Click **SQL Editor**
2. Create new query
3. Copy entire SQL from: `supabase/migrations/20250210_comprehensive_onboarding_fix.sql`
4. Click **Run**
5. Wait for success message

**Or using CLI:**
```bash
supabase db push
```

### Step 2: Test Database Fix

In Supabase SQL Editor, run:

```sql
-- Test 1: Verify column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'onboarding_completed';
-- Expected: Returns "onboarding_completed"

-- Test 2: Verify RLS is enabled
SELECT relrowsecurity 
FROM pg_class 
WHERE relname = 'profiles';
-- Expected: Returns "t" (true)

-- Test 3: Check RLS policies
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;
-- Expected: profiles_insert_own, profiles_select_own, profiles_service_role, profiles_update_own

-- Test 4: Query data (simulates app request)
SELECT id, onboarding_completed FROM public.profiles LIMIT 1;
-- Expected: Returns profile with onboarding_completed value
```

### Step 3: Browser Cache Clear

**Chrome/Edge/Firefox:**
- Press: `Ctrl+Shift+Delete`
- Click "All time"
- Check all boxes
- Click "Clear data"

**Safari:**
- Menu → History → Clear History
- Select "All history"
- Click "Clear History"

### Step 4: Hard Refresh App

- **Chrome/Firefox:** `Ctrl+F5` or `Ctrl+Shift+R`
- **Safari:** `Cmd+Shift+R`
- **Safari (iOS):** Close and reopen Safari

### Step 5: Test Onboarding

1. Log out (if logged in)
2. Log back in
3. Navigate to `/onboarding` (should be auto-redirected)
4. Complete onboarding steps
5. Check browser console (F12) for logs:
   ```
   [Onboarding] Fetching status for user: xxx
   [Onboarding] Status fetched: false
   [Onboarding] Setting up realtime subscription...
   ```
6. No 406 errors should appear

## Testing Checklist

- [ ] Applied SQL migration in Supabase
- [ ] Ran test queries - all passed
- [ ] Cleared browser cache
- [ ] Hard refreshed app
- [ ] Logged out and back in
- [ ] No 406 errors in console
- [ ] Onboarding redirects correctly
- [ ] Can complete onboarding
- [ ] After completion, AI features accessible
- [ ] Dashboard shows onboarding banner correctly

## Debug Output

If issues persist, check browser console (F12) for these logs:

**Good signs:**
```
[Onboarding] Fetching status for user: 983d648a-bc79-4ca9-aaa5-66bae1a97ccb
[Onboarding] Status fetched: false
[Onboarding] Setting up realtime subscription for user: 983d648a-bc79-4ca9-aaa5-66bae1a97ccb
[Onboarding] Subscription status: SUBSCRIBED
```

**Bad signs:**
```
[Onboarding] Query error: {...}  // RLS policy issue
[Onboarding] Fetch error: ...  // Network or auth issue
406 Not Acceptable  // Column or policy not fixed
```

## Files Modified

```
src/hooks/useOnboardingStatus.ts                          [UPDATED]
src/components/auth/OnboardingGuard.tsx                   [UPDATED]
src/pages/Dashboard.tsx                                    [CREATED]
src/router.tsx                                             [UPDATED]
src/hooks/useChat.ts                                       [UPDATED]
supabase/functions/chat/index.ts                          [UPDATED]
supabase/migrations/20250210_comprehensive_onboarding_fix.sql [CREATED]
```

## Feature Summary

### What Should Work Now

✅ Users redirected to `/onboarding` after signup  
✅ Users cannot skip onboarding  
✅ Cannot access `/chat` `/training` `/modules` without completing  
✅ Dashboard shows onboarding banner  
✅ Onboarding status checked from database  
✅ Real-time updates when onboarding completes  
✅ AI features unlocked after completion  
✅ Error messages show if trying to use AI without onboarding  

## Support

If still encountering issues:
1. Check browser console (F12) for detailed logs
2. Verify migration was applied (test queries in Supabase)
3. Check `auth.users` table has the user
4. Check `public.profiles` table has the user's profile
5. Verify RLS policies exist and are correct

## Quick Reference

| File | Change | Status |
|------|--------|--------|
| useOnboardingStatus.ts | Enhanced with logging | ✅ |
| OnboardingGuard.tsx | Route protection | ✅ |
| Dashboard.tsx | New page | ✅ |
| router.tsx | Added routes | ✅ |
| Database | Column + RLS fix | ⏳ Apply migration |
