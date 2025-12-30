import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { adminService } from '@/services/adminService';

interface UseAdminSubscriptionsRealtimeParams {
  plan?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const useAdminSubscriptionsRealtime = ({
  plan,
  status,
  page = 1,
  limit = 10,
}: UseAdminSubscriptionsRealtimeParams = {}) => {
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'subscriptions', { plan, status, page, limit }],
    queryFn: async () => {
      const offset = (page - 1) * limit;
      return adminService.getSubscriptions({
        plan,
        status,
        limit,
        offset,
      });
    },
    staleTime: 5000,
  });

  useEffect(() => {
    if (!isSubscribed) {
      const channel = supabase
        .channel('admin-subscriptions-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscriptions',
          },
          (payload) => {
            queryClient.invalidateQueries({
              queryKey: ['admin', 'subscriptions'],
            });
            refetch();
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
    }
  }, [isSubscribed, queryClient, refetch]);

  const invalidateSubscriptions = () => {
    queryClient.invalidateQueries({
      queryKey: ['admin', 'subscriptions'],
    });
  };

  return {
    subscriptions: data?.subscriptions || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error: error as Error | null,
    refetch,
    invalidateSubscriptions,
    isSubscribed,
  };
};
