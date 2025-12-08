import { useQuery } from '@tanstack/react-query';
import { callAdminFunction } from '@/utils/adminApi';

export const useAdminPlans = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: async () => {
      return callAdminFunction('admin-plans');
    },
  });

  return {
    plans: (data?.plans || data || []) as unknown[],
    isLoading,
    error: error as Error | null,
  };
};
