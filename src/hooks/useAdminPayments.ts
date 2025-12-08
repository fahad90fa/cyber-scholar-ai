import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';

interface UseAdminPaymentsParams {
  status?: string;
  page?: number;
  limit?: number;
}

export const useAdminPayments = ({
  status,
  page = 1,
  limit = 10,
}: UseAdminPaymentsParams = {}) => {
  const queryClient = useQueryClient();
  
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
  });

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
  };
};
