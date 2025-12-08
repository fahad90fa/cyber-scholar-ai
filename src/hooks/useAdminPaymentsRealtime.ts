import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseAdminPaymentsRealtimeParams {
  status?: string;
  page?: number;
  limit?: number;
}

export const useAdminPaymentsRealtime = ({
  status,
  page = 1,
  limit = 10,
}: UseAdminPaymentsRealtimeParams = {}) => {
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'payments', { status, page, limit }],
    queryFn: async () => {
      const offset = (page - 1) * limit;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (status && status !== 'all') params.append('status', status);

      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        throw new Error('Admin token not found');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-payments?${params.toString()}`,
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
        throw new Error(`Failed to fetch payments: ${response.statusText}`);
      }

      const paginatedPayments = await response.json();

      return {
        payments: paginatedPayments || [],
        total: paginatedPayments?.length || 0,
        page,
        limit,
        totalPages: Math.ceil((paginatedPayments?.length || 0) / limit),
      };
    },
    staleTime: 5000,
  });

  useEffect(() => {
    if (!isSubscribed) {
      const channel = supabase
        .channel('admin-payments-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payment_requests',
          },
          (payload) => {
            queryClient.invalidateQueries({
              queryKey: ['admin', 'payments'],
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

  const mutate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['admin', 'payments', { status, page, limit }],
    });
    return refetch();
  };

  return {
    payments: data?.payments || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error: error as Error | null,
    mutate,
    refetch,
    isSubscribed,
  };
};
