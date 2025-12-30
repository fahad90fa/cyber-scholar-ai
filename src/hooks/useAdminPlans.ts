import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';

export const useAdminPlans = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: async () => {
      return adminService.getPlans();
    },
  });

  return {
    plans: (data?.plans || data || []) as unknown[],
    isLoading,
    error: error as Error | null,
  };
};
