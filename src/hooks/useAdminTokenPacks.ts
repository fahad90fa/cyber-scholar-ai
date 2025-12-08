import { useQuery } from '@tanstack/react-query';
import { callAdminFunction } from '@/utils/adminApi';

export const useAdminTokenPacks = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'token-packs'],
    queryFn: async () => {
      return callAdminFunction('admin-token-packs');
    },
  });

  const tokenPacks = data?.token_packs || [];
  const purchaseRequests = data?.purchase_requests || [];

  return {
    tokenPacks,
    purchaseRequests,
    isLoading,
    error: error as Error | null,
  };
};
