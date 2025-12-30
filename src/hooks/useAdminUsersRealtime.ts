import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { adminService } from '@/services/adminService';

interface UseAdminUsersRealtimeParams {
  search?: string;
  tier?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useAdminUsersRealtime = ({
  search,
  tier,
  status,
  page = 1,
  limit = 10,
  sortBy = 'created_at',
  sortOrder = 'desc',
}: UseAdminUsersRealtimeParams = {}) => {
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'users', { search, tier, status, page, limit, sortBy, sortOrder }],
    queryFn: async () => {
      const offset = (page - 1) * limit;
      return adminService.getUsers({
        search,
        tier,
        status,
        limit,
        offset,
        sortBy,
        sortOrder,
      });
    },
    staleTime: 5000,
  });

  useEffect(() => {
    if (!isSubscribed) {
      const channel = supabase
        .channel('admin-profiles-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
          },
          (payload) => {
            queryClient.invalidateQueries({
              queryKey: ['admin', 'users'],
            });
            refetch();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscriptions',
          },
          (payload) => {
            queryClient.invalidateQueries({
              queryKey: ['admin', 'users'],
            });
            refetch();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'token_transactions',
          },
          (payload) => {
            queryClient.invalidateQueries({
              queryKey: ['admin', 'users'],
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

  const invalidateUsers = () => {
    queryClient.invalidateQueries({
      queryKey: ['admin', 'users'],
    });
  };

  return {
    users: data?.users || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error: error as Error | null,
    refetch,
    invalidateUsers,
    isSubscribed,
  };
};
