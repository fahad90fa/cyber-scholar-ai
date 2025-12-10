# CyberScholar Onboarding & Chat Security System Setup

## Overview

This document outlines the complete onboarding flow and chat security system for CyberScholar AI. The system includes:

1. **Onboarding Flow** - 5-step guided setup after user signup
2. **Chat Security System** - Optional password protection for chat history
3. **Realtime Synchronization** - Supabase Realtime listeners for instant updates
4. **Security Logging** - Complete audit trail of all security events

## Architecture Components

### Database Schema

#### New Columns Added to `profiles` Table

```sql
- onboarding_completed: BOOLEAN (default: FALSE)
- onboarding_completed_at: TIMESTAMPTZ
- chat_security_enabled: BOOLEAN (default: FALSE)
- chat_password_hash: TEXT (Argon2 hashed)
- chat_password_salt: TEXT (unique per user)
- chat_password_set_at: TIMESTAMPTZ
- chat_security_hint: TEXT (optional)
- failed_chat_password_attempts: INTEGER (default: 0)
- chat_locked_until: TIMESTAMPTZ
- last_chat_access: TIMESTAMPTZ
```

#### New Table: `chat_security_log`

```sql
- id: UUID (PRIMARY KEY)
- user_id: UUID (FOREIGN KEY → profiles)
- action: TEXT (password_set, password_changed, password_verified, password_failed, etc.)
- ip_address: TEXT
- user_agent: TEXT
- success: BOOLEAN
- metadata: JSONB
- created_at: TIMESTAMPTZ
```

### Supabase Edge Function

**Location:** `supabase/functions/chat-security/index.ts`

**Supported Actions:**
- `set_password` - Set new chat password (Argon2 hashing)
- `verify_password` - Verify password and issue session token
- `change_password` - Change existing password
- `disable_security` - Disable chat security with password verification

**Security Features:**
- Argon2id hashing with 64MB memory cost
- Unique salt per password
- Failed attempt tracking (max 5 attempts)
- Progressive lockout (5min at 3 attempts, 15min at 5 attempts)
- Session token expiry (1 hour)
- IP and User-Agent logging

### Frontend Architecture

#### Pages

- **`src/pages/Onboarding.tsx`** - Main onboarding orchestration component

#### Components

**Onboarding Steps:**
- `src/components/onboarding/WelcomeStep.tsx` - Platform introduction
- `src/components/onboarding/ProfileStep.tsx` - User profile setup
- `src/components/onboarding/ChatFeaturesStep.tsx` - AI chat introduction
- `src/components/onboarding/ChatSecurityStep.tsx` - Optional password setup
- `src/components/onboarding/CompletionStep.tsx` - Success screen

**Onboarding Utilities:**
- `src/components/onboarding/OnboardingLayout.tsx` - Layout wrapper
- `src/components/onboarding/ProgressIndicator.tsx` - Step progress tracker
- `src/components/onboarding/PasswordStrengthMeter.tsx` - Password strength display

**Chat Security:**
- `src/components/chat/ChatPasswordModal.tsx` - Password verification modal
- `src/components/chat/ChatSecurityGuard.tsx` - Route protector
- `src/components/chat/ChatSecurityBadge.tsx` - Security status badge

**Settings:**
- `src/components/settings/ChatSecuritySettings.tsx` - Main security settings page
- `src/components/settings/EnableSecurityModal.tsx` - Enable security modal
- `src/components/settings/ChangePasswordModal.tsx` - Change password modal
- `src/components/settings/DisableSecurityModal.tsx` - Disable security modal
- `src/components/settings/SecurityLogModal.tsx` - View security log

**Auth Guards:**
- `src/components/auth/OnboardingGuard.tsx` - Redirect completed onboarding users

#### Hooks

- **`src/hooks/useOnboarding.ts`** - Onboarding state and logic
  - `currentStep` - Current step in flow
  - `onboardingData` - User input data
  - `completeOnboarding()` - Finish onboarding

- **`src/hooks/useChatSecurity.ts`** - Chat security management
  - `profile` - User's security profile
  - `session` - Current session token
  - `canAccessChat()` - Check if user can access chat
  - `verifyPassword()` - Verify password
  - `setPassword()` - Set new password
  - `changePassword()` - Change password
  - `disableSecurity()` - Disable security

#### Services

- **`src/services/chatSecurityService.ts`** - API layer
  - Handles all calls to Supabase edge function
  - Manages profile updates
  - Fetches security logs

#### Stores (Zustand)

- **`src/stores/chatSecurityStore.ts`** - Session state management
  - `session` - Current session token and expiry
  - `setSession()` - Store session
  - `clearSession()` - Clear session
  - `isSessionValid()` - Check session validity

#### Utilities

- **`src/utils/chatSecurityUtils.ts`** - Helper functions
  - `validatePasswordStrength()` - Password strength checking
  - `isAccountLocked()` - Check lockout status
  - `formatLockoutTime()` - Format remaining lockout time
  - `validateOnboardingProfile()` - Profile validation
  - `compressImage()` - Avatar image compression

#### Types

- **`src/types/chatSecurity.types.ts`** - TypeScript interfaces
  - `ChatSecurityProfile`
  - `ChatSecurityLogEntry`
  - `ChatSecuritySessionToken`
  - `OnboardingData`
  - `PasswordStrengthResult`

### Router Updates

**File:** `src/router.tsx`

**New Routes:**
```tsx
<Route 
  path="/onboarding" 
  element={
    <ProtectedRoute>
      <OnboardingGuard>
        <Onboarding />
      </OnboardingGuard>
    </ProtectedRoute>
  } 
/>
```

**Updated Routes:**
```tsx
<Route 
  path="/chat" 
  element={
    <ProtectedRoute>
      <SubscriptionRequired>
        <ChatSecurityGuard>
          <ProtectedLayout>
            <Index />
          </ProtectedLayout>
        </ChatSecurityGuard>
      </SubscriptionRequired>
    </ProtectedRoute>
  } 
/>
```

## User Flow

### Signup to Onboarding

1. User signs up → Auth success
2. Check `onboarding_completed` in profile
3. If FALSE → Redirect to `/onboarding`
4. If TRUE → Redirect to `/dashboard`

### Onboarding Steps

**Step 1: Welcome**
- Platform overview
- Learning paths overview
- What users will learn
- "Let's Get Started" button

**Step 2: Profile**
- Upload avatar (optional, with compression)
- Enter full name (required)
- Enter username (optional)
- Validation on continue

**Step 3: Chat Features**
- Explain CyberMentor AI
- Token system overview
- 6 learning modules
- Adaptive learning explanation

**Step 4: Secure Your Chats (Optional)**
- Toggle to enable security
- Set password with strength meter
- Confirm password
- Optional password hint
- Explain no recovery option
- Skip option for later

**Step 5: Completion**
- Success animation
- Summary of setup
- Next steps suggestions
- "Go to Dashboard" button

### Chat Access with Security

1. User logs in
2. Accesses `/chat`
3. `ChatSecurityGuard` checks `chat_security_enabled`
4. If enabled and no valid session:
   - Show `ChatPasswordModal`
   - User enters password
   - Verify via edge function
   - On success: Store session token (memory only, 1 hour TTL)
   - Grant access
5. If disabled or session valid:
   - Direct access to chat

## Realtime Features

### Profile Changes Listener

```tsx
supabase
  .channel(`chat-security-${user.id}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'profiles',
    filter: `id=eq.${user.id}`,
  }, (payload) => {
    // Detect password change: invalidate session
    if (payload.old?.chat_password_set_at !== payload.new?.chat_password_set_at) {
      clearSession()
      showNotification('Your password was changed. Please verify again.')
    }
  })
  .subscribe()
```

### Lockout Timer Update

- Real-time check for `chat_locked_until`
- Display remaining lockout time
- Auto-unlock when timer expires

## Security Features

### Password Security

✅ **Argon2id Hashing**
- Algorithm: Argon2id
- Memory Cost: 65,536 KB (64MB)
- Time Cost: 3
- Parallelism: 4

✅ **Salt Management**
- Unique UUID salt per password
- Never reused
- Stored separately in database

✅ **Password Requirements**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

✅ **Failed Attempt Protection**
- 3 attempts → 5 minute lockout
- 5 attempts → 15 minute lockout
- Counter reset on successful verification
- Logged with IP and User-Agent

✅ **Session Management**
- Memory-only session tokens
- NOT stored in localStorage
- 1-hour expiration
- Invalidated on password change
- Invalidated on security toggle

✅ **Audit Logging**
- All security actions logged
- IP address captured
- User-Agent captured
- Metadata stored as JSONB
- RLS policies: users can view own logs only

### No Password Recovery

- **Design Decision:** Passwords are non-recoverable
- **User Option:** Disable and re-enable security
- **Reason:** Simplifies security model, no recovery attack surface

## Configuration

### Password Requirements

Edit `src/utils/chatSecurityUtils.ts` → `validatePasswordStrength()`

### Lockout Timings

Edit `supabase/functions/chat-security/index.ts`:
- Change 3/5 attempt thresholds
- Change 5min/15min durations

### Session Expiry

Edit `supabase/functions/chat-security/index.ts`:
- Change `new Date(Date.now() + 60 * 60 * 1000)` (currently 1 hour)

### Hashing Parameters

Edit `supabase/functions/chat-security/index.ts`:
- `memoryCost`: 65536 (64MB)
- `timeCost`: 3
- `parallelism`: 4

## Implementation Checklist

- [x] Database migration (`20250208_add_chat_security_system.sql`)
- [x] Supabase Edge Function (`chat-security/index.ts`)
- [x] Types (`chatSecurity.types.ts`)
- [x] Utilities (`chatSecurityUtils.ts`)
- [x] Service (`chatSecurityService.ts`)
- [x] Store (`chatSecurityStore.ts`)
- [x] Hooks (`useOnboarding.ts`, `useChatSecurity.ts`)
- [x] Onboarding components (5 step components)
- [x] Chat security components (modal, guard, badge)
- [x] Settings components (4 modal components)
- [x] Router updates (onboarding route, chat guard)
- [x] OnboardingGuard component

## Integration Steps

### 1. Run Database Migration

```bash
# Apply the migration to Supabase
# File: supabase/migrations/20250208_add_chat_security_system.sql
npx supabase db push
```

### 2. Deploy Edge Function

```bash
# Deploy the chat-security function
npx supabase functions deploy chat-security
```

### 3. Add to Settings Page

In `src/pages/SettingsPage.tsx`, add the ChatSecuritySettings section:

```tsx
import { ChatSecuritySettings } from '@/components/settings/ChatSecuritySettings'

// In the component:
<ChatSecuritySettings />
```

### 4. Update Auth Success Handler

In your auth callback/signup handler:

```tsx
// After successful signup/login
const { data: profile } = await supabase
  .from('profiles')
  .select('onboarding_completed')
  .eq('id', user.id)
  .single()

if (!profile?.onboarding_completed) {
  navigate('/onboarding')
} else {
  navigate('/dashboard')
}
```

## Testing Guide

### Test Onboarding Flow

1. Create new account
2. Should redirect to `/onboarding`
3. Complete all 5 steps
4. Can skip security step
5. After completion: redirect to `/dashboard`
6. Refresh page: should not return to onboarding

### Test Chat Security - Enabled

1. Enable security during onboarding
2. Set password: `SecurePass123!`
3. Complete onboarding
4. Logout and login
5. Go to `/chat`
6. Modal should appear asking for password
7. Enter wrong password → "Incorrect password" error
8. After 3 failed attempts → 5 min lockout
9. After 5 failed attempts → 15 min lockout
10. Enter correct password → Grant access
11. Refresh page → Access granted (session valid)
12. Wait 1 hour → Session expires, ask for password again

### Test Chat Security - Disabled

1. Skip security during onboarding
2. Complete onboarding
3. Logout and login
4. Go to `/chat`
5. Should have direct access (no modal)

### Test Settings

1. Go to `/settings` → Chat Security
2. If security disabled: "Enable Chat Security" button
3. Click → Enable Security Modal
4. If security enabled:
   - "Change Password" button
   - "View Security Log" button
   - "Disable Security" button
5. Change password: must verify current password first
6. View log: shows all security events with timestamps
7. Disable security: must confirm with warning

### Test Real-time

1. Open two browser windows (same user)
2. Change password in window 1
3. Window 2: notification "Password was changed"
4. Window 2: session cleared, ask for password again

## Database Queries

### Check User's Security Status

```sql
SELECT 
  chat_security_enabled,
  chat_password_set_at,
  failed_chat_password_attempts,
  chat_locked_until,
  last_chat_access
FROM profiles
WHERE id = 'user-uuid';
```

### View Security Log

```sql
SELECT 
  action,
  success,
  ip_address,
  created_at,
  metadata
FROM chat_security_log
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC
LIMIT 50;
```

### Count Failed Attempts (Last Hour)

```sql
SELECT COUNT(*) as failed_attempts
FROM chat_security_log
WHERE user_id = 'user-uuid'
  AND action = 'password_failed'
  AND success = FALSE
  AND created_at > NOW() - INTERVAL '1 hour';
```

## Performance Considerations

- **Polling Interval:** 2 seconds for profile/token updates
- **Session TTL:** 1 hour (adjust if needed)
- **Lockout Duration:** 5-15 minutes (user-friendly)
- **Password Hashing:** ~1-2 seconds (Argon2, suitable for auth)
- **Realtime Subscriptions:** Minimal overhead, only on profile changes

## Troubleshooting

### User Can't Access Onboarding

Check:
- User is authenticated (ProtectedRoute working)
- OnboardingGuard not redirecting (check profile query)
- Browser console for errors

### Password Verification Failing

Check:
- Edge function deployed successfully
- Supabase environment variables set
- Database migration applied
- Salt is being concatenated with password

### Session Not Persisting

Check:
- Session stored in Zustand store (memory only)
- Session expiry not exceeded
- No clearSession() calls in realtime listener

### Realtime Not Working

Check:
- Supabase Realtime enabled in project
- User has RLS permissions on tables
- Channel subscription successful (no errors in console)

## Notes

- **Password Storage:** Argon2 hashes only, passwords never logged/cached
- **Session Storage:** Memory only, cleared on page refresh
- **Recovery:** No recovery mechanism; users disable and re-enable security
- **Accessibility:** All components keyboard accessible, proper ARIA labels
- **Mobile:** Fully responsive design, touch-friendly inputs

## Migration Path

For existing users:
- `onboarding_completed` defaults to `FALSE`
- Existing users redirected to onboarding on next login
- Can skip security step to go directly to dashboard
- Can enable security anytime in settings

## Files Created

```
Database:
- supabase/migrations/20250208_add_chat_security_system.sql

Edge Function:
- supabase/functions/chat-security/index.ts

Frontend:
- src/pages/Onboarding.tsx
- src/types/chatSecurity.types.ts
- src/utils/chatSecurityUtils.ts
- src/services/chatSecurityService.ts
- src/stores/chatSecurityStore.ts
- src/hooks/useOnboarding.ts
- src/hooks/useChatSecurity.ts
- src/components/auth/OnboardingGuard.tsx
- src/components/onboarding/OnboardingLayout.tsx
- src/components/onboarding/ProgressIndicator.tsx
- src/components/onboarding/PasswordStrengthMeter.tsx
- src/components/onboarding/WelcomeStep.tsx
- src/components/onboarding/ProfileStep.tsx
- src/components/onboarding/ChatFeaturesStep.tsx
- src/components/onboarding/ChatSecurityStep.tsx
- src/components/onboarding/CompletionStep.tsx
- src/components/chat/ChatPasswordModal.tsx
- src/components/chat/ChatSecurityGuard.tsx
- src/components/chat/ChatSecurityBadge.tsx
- src/components/settings/ChatSecuritySettings.tsx
- src/components/settings/EnableSecurityModal.tsx
- src/components/settings/ChangePasswordModal.tsx
- src/components/settings/DisableSecurityModal.tsx
- src/components/settings/SecurityLogModal.tsx

Router:
- src/router.tsx (updated)
```

## Next Steps

1. Run migrations and deploy edge function
2. Test onboarding flow end-to-end
3. Add ChatSecuritySettings to SettingsPage
4. Update auth callbacks for onboarding redirect
5. Test chat security with enabled passwords
6. Monitor security logs in production
7. Adjust lockout timings based on user feedback

