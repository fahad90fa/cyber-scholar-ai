import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { callAdminFunction } from '@/utils/adminApi';

export interface AdminStats {
  total_users: number;
  active_subscriptions: {
    starter: number;
    pro: number;
    pro_plus: number;
    enterprise: number;
  };
  pending_payments: number;
  monthly_revenue: number;
  total_revenue: number;
  token_usage: number;
  today_signups: number;
}

export const useAdminStatsRealtime = () => {
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      return callAdminFunction('admin-stats') as Promise<AdminStats>;
    },
    staleTime: 10000,
  });

  useEffect(() => {
    if (!isSubscribed) {
      const channels = [
        supabase
          .channel('admin-users-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'profiles',
            },
            () => {
              queryClient.invalidateQueries({
                queryKey: ['admin', 'stats'],
              });
              refetch();
            }
          ),
        supabase
          .channel('admin-subscriptions-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'subscriptions',
            },
            () => {
              queryClient.invalidateQueries({
                queryKey: ['admin', 'stats'],
              });
              refetch();
            }
          ),
        supabase
          .channel('admin-payments-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'payment_requests',
            },
            () => {
              queryClient.invalidateQueries({
                queryKey: ['admin', 'stats'],
              });
              refetch();
            }
          ),
        supabase
          .channel('admin-tokens-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'token_transactions',
            },
            () => {
              queryClient.invalidateQueries({
                queryKey: ['admin', 'stats'],
              });
              refetch();
            }
          ),
      ];

      channels.forEach(channel => {
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsSubscribed(true);
          }
        });
      });

      return () => {
        channels.forEach(channel => {
          channel.unsubscribe();
        });
      };
    }
  }, [isSubscribed, queryClient, refetch]);

  return {
    totalUsers: stats?.total_users || 0,
    activeSubscriptions: stats?.active_subscriptions || {
      starter: 0,
      pro: 0,
      pro_plus: 0,
      enterprise: 0,
    },
    pendingPayments: stats?.pending_payments || 0,
    monthlyRevenue: stats?.monthly_revenue || 0,
    totalRevenue: stats?.total_revenue || 0,
    todaySignups: stats?.today_signups || 0,
    tokenUsage: stats?.token_usage || 0,
    isLoading,
    error: error as Error | null,
    refetch,
    isSubscribed,
  };
};
