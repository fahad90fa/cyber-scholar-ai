import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { adminService } from '@/services/adminService';

export const useAdminPlansRealtime = () => {
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { data: plans = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: async () => {
      return adminService.getPlans();
    },
    staleTime: 5000,
  });

  useEffect(() => {
    if (!isSubscribed) {
      const channel = supabase
        .channel('admin-plans-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscription_plans',
          },
          (payload) => {
            queryClient.invalidateQueries({
              queryKey: ['admin', 'plans'],
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

  return {
    plans,
    isLoading,
    error: error as Error | null,
    refetch,
    isSubscribed,
  };
};
