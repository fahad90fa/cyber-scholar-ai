## Admin User Info Page Deployment Guide

### 1. Database

Apply migration:
```bash
supabase migration up
```

### 2. Edge Functions

Deploy:
```bash
supabase functions deploy track-user-ip
supabase functions deploy update-user-location
supabase functions deploy admin-user-info
```

### 3. Environment Variables

Add to `.env.local`:
```
VITE_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
```

### 4. Frontend Router

Update `src/router.tsx`:
```tsx
import AdminInfoPage from "./pages/admin/AdminInfoPage";

<Route 
  path="/admin/info" 
  element={
    <AdminProtectedRoute>
      <AdminInfoPage />
    </AdminProtectedRoute>
  } 
/>
```

### 5. Add Location Sharing to Settings

In `src/pages/SettingsPage.tsx`:
```tsx
import LocationSharingToggle from "@/components/settings/LocationSharingToggle";
// Add to settings UI
```

### 6. Integrate IP Tracking

Call on auth context setup or login. Track IP:
```tsx
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/track-user-ip`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
```

### 7. Google Maps Setup

1. Google Cloud Console → Enable Maps JavaScript API
2. Create API key (domain-restricted)
3. Add to `.env.local` as `VITE_GOOGLE_MAPS_API_KEY`

### 8. Build

```bash
npm run build
npm run lint
```

## RLS Security

- user_devices: Deny anon, allow service_role only
- user_ip_history: Deny anon, allow service_role only
- Admin check: admin-user-info verifies is_admin in profiles
- All endpoints validate JWT token

## Components

- **AdminInfoPage**: Main page (split view: users + details)
- **AdminInfoUserList**: Searchable user list with IP
- **AdminInfoDetail**: IP history + device info
- **AdminInfoNetworkTab**: Current IP, MAC, full history
- **AdminInfoLocationTab**: Google Map with marker
- **LocationSharingToggle**: User settings for location opt-in
- **useAdminUserInfo**: Fetch admin data
- **useAdminUserList**: Fetch all users
- **useLocationSharing**: Client-side location updates
