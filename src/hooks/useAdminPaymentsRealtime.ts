import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { adminService } from '@/services/adminService';

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
      return adminService.getPayments({
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
