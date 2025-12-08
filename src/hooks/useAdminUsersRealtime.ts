import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        sortBy,
        sortOrder,
      });

      if (search) params.append('search', search);
      if (tier && tier !== 'all') params.append('tier', tier);
      if (status && status !== 'all') params.append('status', status);

      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        throw new Error('Admin token not found');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users?${params.toString()}`,
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
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const paginatedUsers = await response.json();

      return {
        users: paginatedUsers || [],
        total: paginatedUsers?.length || 0,
        page,
        limit,
        totalPages: Math.ceil((paginatedUsers?.length || 0) / limit),
      };
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
