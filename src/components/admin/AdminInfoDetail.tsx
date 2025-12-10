import { useEffect } from 'react';
import { Loader2, Globe, AlertCircle, MapPin } from 'lucide-react';
import AdminInfoNetworkTab from './AdminInfoNetworkTab';
import AdminInfoLocationTab from './AdminInfoLocationTab';

interface Device {
  ip_current: string | null;
  ip_last_seen_at: string | null;
  mac_address: string | null;
  last_lat: number | null;
  last_lng: number | null;
  location_updated_at: string | null;
}

interface IPHistoryEntry {
  id: string;
  ip: string;
  ip_version: string;
  first_seen_at: string;
  last_seen_at: string;
  geo_country: string | null;
  geo_city: string | null;
}

interface UserDetail {
  user: { id: string; email: string; full_name: string | null } | null;
  devices: Device[];
  ipHistory: IPHistoryEntry[];
  loading: boolean;
  error: string | null;
  fetchUserInfo: () => void;
}

export default function AdminInfoDetail({ userDetail }: { userDetail: UserDetail }) {
  const { user, devices, ipHistory, loading, error, fetchUserInfo } = userDetail;

  const device = devices?.[0];

  return (
    <div className="h-full flex flex-col">
      {error && (
        <div className="p-4 m-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : user ? (
        <>
          {/* Header */}
          <div className="px-6 py-4 border-b border-border bg-card/50">
            <h2 className="text-lg font-semibold text-foreground">
              {user.full_name || user.email}
            </h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          {/* Tabs */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 gap-6 p-6">
              {/* Network Info */}
              <AdminInfoNetworkTab device={device} ipHistory={ipHistory} />

              {/* Location */}
              {device?.last_lat && device?.last_lng && (
                <AdminInfoLocationTab device={device} />
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
