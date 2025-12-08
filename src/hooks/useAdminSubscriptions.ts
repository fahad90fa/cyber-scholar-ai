import { useQuery, useQueryClient } from '@tanstack/react-query';

interface UseAdminSubscriptionsParams {
  plan?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const useAdminSubscriptions = ({
  plan,
  status,
  page = 1,
  limit = 10,
}: UseAdminSubscriptionsParams = {}) => {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'subscriptions', { plan, status, page, limit }],
    queryFn: async () => {
      const offset = (page - 1) * limit;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (plan && plan !== 'all') params.append('plan', plan);
      if (status && status !== 'all') params.append('status', status);

      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        throw new Error('Admin token not found');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-subscriptions?${params.toString()}`,
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
        throw new Error(`Failed to fetch subscriptions: ${response.statusText}`);
      }

      const paginatedSubscriptions = await response.json();

      return {
        subscriptions: paginatedSubscriptions || [],
        total: paginatedSubscriptions?.length || 0,
        page,
        limit,
        totalPages: Math.ceil((paginatedSubscriptions?.length || 0) / limit),
      };
    },
  });

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
  };
};
