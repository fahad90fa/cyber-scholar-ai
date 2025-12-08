import { useQuery, useQueryClient } from '@tanstack/react-query';
import { callAdminFunction } from '@/utils/adminApi';

export const useAdminSettings = () => {
  const queryClient = useQueryClient();
  const { data: bankSettings, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'settings', 'bank'],
    queryFn: async () => {
      return callAdminFunction('admin-settings');
    },
  });

  const invalidateSettings = () => {
    queryClient.invalidateQueries({
      queryKey: ['admin', 'settings'],
    });
  };

  return {
    bankSettings: bankSettings || null,
    isLoading,
    error: error as Error | null,
    refetch,
    invalidateSettings,
  };
};
