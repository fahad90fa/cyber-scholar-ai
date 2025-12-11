import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  user_id: string | null;
  email_snapshot: string | null;
  event_type: string;
  event_category: string;
  description: string | null;
  ip_address: string;
  user_agent: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface UseAdminLogsParams {
  userId?: string;
  eventType?: string;
  category?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  liveUpdates?: boolean;
}

export const useAdminLogs = ({
  userId,
  eventType,
  category,
  fromDate,
  toDate,
  page = 1,
  limit = 50,
  liveUpdates = true,
}: UseAdminLogsParams = {}) => {
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'logs', { userId, eventType, category, fromDate, toDate, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (userId) params.append('userId', userId);
      if (eventType) params.append('eventType', eventType);
      if (category && category !== 'all') params.append('category', category);
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);

      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        throw new Error('Admin token not found');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-get-logs?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'x-admin-token': adminToken,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }

      return response.json();
    },
  });

  useEffect(() => {
    if (data?.data) {
      setLogs(data.data);
    }
  }, [data]);

  useEffect(() => {
    if (!liveUpdates) {
      setIsSubscribed(false);
      return;
    }

    const channel = supabase
      .channel('audit-log-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_log',
        },
        (payload) => {
          const newLog = payload.new as AuditLog;
          setLogs((prev) => [newLog, ...prev]);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [liveUpdates]);

  return {
    logs,
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 50,
    totalPages: data?.totalPages || 1,
    isLoading,
    error: error as Error | null,
    refetch,
    isSubscribed,
  };
};
