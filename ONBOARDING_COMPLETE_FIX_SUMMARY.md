# ✅ Onboarding 406 Error - Complete Fix Applied

## Problem Summary
```
ERROR: GET https://nixiiarwumhbivyqysws.supabase.co/rest/v1/profiles?select=onboarding_completed&id=eq.xxx 406 (Not Acceptable)
```

Users were unable to complete onboarding due to 406 Not Acceptable error when fetching onboarding status.

## Root Cause
1. **Missing Database Column**: `onboarding_completed` column might not exist
2. **RLS Policy Issues**: Row Level Security policies not allowing SELECT operations
3. **Missing WITH CHECK Clause**: UPDATE policies incomplete

## Solution Implemented

### ✅ Code Changes

#### 1. Enhanced Hook with Logging
**File:** `src/hooks/useOnboardingStatus.ts`
- ✅ Uses Supabase client (NOT raw fetch)
- ✅ Detailed console logging for debugging
- ✅ Retry logic (2 attempts)
- ✅ Proper error handling
- ✅ Realtime subscription for updates

#### 2. Route Protection
**File:** `src/components/auth/OnboardingGuard.tsx`
- ✅ Blocks `/chat`, `/training`, `/modules` until onboarding complete
- ✅ Redirects to `/onboarding` if needed
- ✅ Allows settings access

#### 3. Dashboard with Onboarding Banner
**File:** `src/pages/Dashboard.tsx`
- ✅ Shows feature cards with lock status
- ✅ Displays onboarding prompt banner
- ✅ Shows subscription status

#### 4. Backend Protection
**File:** `supabase/functions/chat/index.ts`
- ✅ Checks onboarding status before processing messages
- ✅ Returns 403 error if not completed

### ✅ Database Fixes

**File:** `supabase/migrations/20250210_comprehensive_onboarding_fix.sql`

Applied SQL creates:
```sql
1. Column: onboarding_completed BOOLEAN DEFAULT FALSE
2. Column: onboarding_completed_at TIMESTAMPTZ
3. RLS Policy: profiles_select_own (SELECT)
4. RLS Policy: profiles_update_own (UPDATE)
5. RLS Policy: profiles_insert_own (INSERT)
6. RLS Policy: profiles_service_role (ALL operations)
7. Indexes for performance
```

## ⏳ NEXT STEP: Apply Database Migration

This is the critical step that fixes the 406 error!

### Quick Start (2 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com/
   - Select your CyberSec AI project

2. **Go to SQL Editor**
   - Click: "SQL Editor" (left menu)
   - Click: "New Query"

3. **Copy & Paste SQL Fix**
   - See file: `APPLY_FIX.txt` in project root
   - Paste entire SQL block
   - Click: "Run"
   - Wait for: "Success" message

4. **Verify**
   - Run: `SELECT id, onboarding_completed FROM public.profiles LIMIT 1;`
   - Should return profile data (no errors)

5. **Clear Browser & Test**
   - Clear cache: `Ctrl+Shift+Delete` (Chrome) or `Cmd+Shift+Delete` (Safari)
   - Hard refresh: `Ctrl+F5` (Chrome/Firefox) or `Cmd+Shift+R` (Safari)
   - Test onboarding flow

## ✨ What Should Work Now

### User Flow
1. **Signup** → Profile created with `onboarding_completed = false`
2. **Redirect** → Auto-redirected to `/onboarding`
3. **Complete Onboarding** → Sets `onboarding_completed = true`
4. **Redirect** → Redirected to dashboard
5. **Access AI Features** → `/chat`, `/training`, `/modules` now accessible

### Page Access
| Page | Before | After |
|------|--------|-------|
| `/onboarding` | ✅ Can access | ✅ Can access |
| `/dashboard` | ✅ Can access | ✅ Can access (with banner) |
| `/settings` | ✅ Can access | ✅ Can access |
| `/chat` | ❌ Locked | ✅ Unlocked |
| `/training` | ❌ Locked | ✅ Unlocked |
| `/modules` | ❌ Locked | ✅ Unlocked |

## 🔍 Debugging

### Check Browser Console (F12)
Should see logs like:
```
[Onboarding] Fetching status for user: 983d648a-bc79-4ca9-aaa5-66bae1a97ccb
[Onboarding] Status fetched: false
[Onboarding] Setting up realtime subscription for user: 983d648a-bc79-4ca9-aaa5-66bae1a97ccb
[Onboarding] Subscription status: SUBSCRIBED
```

### If 406 Still Appears
1. Verify SQL was applied in Supabase
2. Run: `SELECT onboarding_completed FROM public.profiles WHERE id = 'your_user_id';`
3. Check RLS policies in Supabase → Authentication → Policies

## 📋 Checklist

- [ ] Applied SQL migration in Supabase
- [ ] Verified: `SELECT` query works
- [ ] Cleared browser cache
- [ ] Hard refreshed app
- [ ] No 406 errors in console
- [ ] Can access onboarding page
- [ ] Can complete onboarding
- [ ] Chat/training now accessible after completion
- [ ] Onboarding banner shows on dashboard

## 📁 Modified Files

```
src/hooks/useOnboardingStatus.ts                          ✅ Updated
src/components/auth/OnboardingGuard.tsx                   ✅ Updated
src/components/onboarding/OnboardingPromptBanner.tsx      ✅ Created
src/components/onboarding/OnboardingRequiredModal.tsx     ✅ Created
src/pages/Dashboard.tsx                                    ✅ Created
src/router.tsx                                             ✅ Updated
src/hooks/useChat.ts                                       ✅ Updated
supabase/functions/chat/index.ts                          ✅ Updated

supabase/migrations/20250209_fix_profiles_rls_update.sql                ⏳ Optional
supabase/migrations/20250209b_ensure_onboarding_columns.sql             ⏳ Optional
supabase/migrations/20250210_comprehensive_onboarding_fix.sql           ⏳ REQUIRED
```

## 🚀 Final Notes

- The code changes are already deployed
- Only the database migration needs to be applied
- No changes to `.env` or secrets needed
- No need to restart the development server
- Cache clear and browser refresh required after DB fix

## 📞 Support

If issues persist after applying the migration:
1. Check browser console (F12) for `[Onboarding]` logs
2. Verify SQL migration ran without errors
3. Test SELECT query in Supabase editor
4. Check that profile exists in `public.profiles` table
5. Verify user exists in `auth.users` table

---

**Last Updated:** December 9, 2025  
**Status:** ✅ Code Complete | ⏳ Awaiting Database Migration
