import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Device {
  id: string;
  ip_current: string | null;
  ip_last_seen_at: string | null;
  mac_address: string | null;
  last_lat: number | null;
  last_lng: number | null;
  location_updated_at: string | null;
  device_label: string | null;
}

interface IPHistory {
  id: string;
  ip: string;
  ip_version: string;
  first_seen_at: string;
  last_seen_at: string;
  geo_country: string | null;
  geo_city: string | null;
}

interface UserInfo {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface AdminUserData {
  user: UserInfo | null;
  devices: Device[];
  ipHistory: IPHistory[];
  loading: boolean;
  error: string | null;
}

export function useAdminUserInfo(userId: string | null) {
  const [data, setData] = useState<AdminUserData>({
    user: null,
    devices: [],
    ipHistory: [],
    loading: false,
    error: null
  });

  const fetchUserInfo = useCallback(async () => {
    if (!userId) return;

    setData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        setData(prev => ({ ...prev, error: 'Admin token not found', loading: false }));
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-user-info?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'x-admin-token': adminToken,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        setData(prev => ({ ...prev, error: error.error || 'Failed to fetch', loading: false }));
        return;
      }

      const result = await response.json();
      setData({
        user: result.user,
        devices: result.devices,
        ipHistory: result.ipHistory,
        loading: false,
        error: null
      });
    } catch (err) {
      setData(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
        loading: false
      }));
    }
  }, [userId]);

  return {
    ...data,
    fetchUserInfo
  };
}

interface UserListItem {
  id: string;
  email: string;
  full_name: string | null;
  current_ip: string;
  last_seen: string | null;
  location: { lat: number | null; lng: number | null } | null;
  location_updated_at: string | null;
}

interface AdminUserListData {
  users: UserListItem[];
  loading: boolean;
  error: string | null;
}

export function useAdminUserList() {
  const [data, setData] = useState<AdminUserListData>({
    users: [],
    loading: false,
    error: null
  });

  const fetchUserList = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        setData(prev => ({ ...prev, error: 'Admin token not found', loading: false }));
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-user-info`,
        {
          method: 'GET',
          headers: {
            'x-admin-token': adminToken,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        setData(prev => ({ ...prev, error: error.error || 'Failed to fetch', loading: false }));
        return;
      }

      const result = await response.json();
      setData({
        users: result.users,
        loading: false,
        error: null
      });
    } catch (err) {
      setData(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
        loading: false
      }));
    }
  }, []);

  return {
    ...data,
    fetchUserList
  };
}
