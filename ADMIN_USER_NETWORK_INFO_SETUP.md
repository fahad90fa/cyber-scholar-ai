# Admin User Network Info Setup - Complete Guide

## Files Created

### Database
- `supabase/migrations/20250210_add_user_network_tracking.sql`
  - Tables: `user_devices`, `user_ip_history`
  - RLS: Admin/service-role only access

### Edge Functions
- `supabase/functions/track-user-ip/index.ts` - Extract & store IP
- `supabase/functions/update-user-location/index.ts` - Update lat/lng
- `supabase/functions/admin-user-info/index.ts` - Admin API

### Frontend Components
- `src/pages/admin/AdminInfoPage.tsx` - Main admin page
- `src/components/admin/AdminInfoUserList.tsx` - User list
- `src/components/admin/AdminInfoDetail.tsx` - Detail container
- `src/components/admin/AdminInfoNetworkTab.tsx` - IP history
- `src/components/admin/AdminInfoLocationTab.tsx` - Google Maps
- `src/components/settings/LocationSharingToggle.tsx` - User opt-in

### Hooks
- `src/hooks/useAdminUserInfo.ts` - Fetch admin data
- `src/hooks/useLocationSharing.ts` - Geolocation handling

## Quick Start

### 1. Database
```bash
supabase db push
```

### 2. Deploy Functions
```bash
supabase functions deploy track-user-ip
supabase functions deploy update-user-location
supabase functions deploy admin-user-info
```

### 3. Google Maps Key
Get from Google Cloud → add to `.env.local`:
```
VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY
```

### 4. Router Update
Add to `src/router.tsx`:
```tsx
import AdminInfoPage from "./pages/admin/AdminInfoPage";

<Route path="/admin/info" element={<AdminProtectedRoute><AdminInfoPage /></AdminProtectedRoute>} />
```

### 5. Optional: Add Location Toggle to Settings
```tsx
import LocationSharingToggle from "@/components/settings/LocationSharingToggle";
// Add to SettingsPage
```

### 6. Build
```bash
npm run build
npm run lint
```

## Admin Panel Features

- Search users by email/name
- View current IP + last seen time
- Full IP history with country/city
- MAC address field (ready for native app)
- Google Map with location marker
- Timestamps for all events

## User-Side Features

- Optional location sharing in settings
- Browser geolocation permission
- Auto-sync lat/lng to backend
- Can disable anytime

## Security

- RLS: No anon key access (service role only)
- JWT validation on all endpoints
- Admin check in admin-user-info
- Encrypted at rest + in transit
