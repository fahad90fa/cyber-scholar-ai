import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { callAdminFunction } from '@/utils/adminApi';

export const useAdminTokenPacksRealtime = () => {
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'token-packs'],
    queryFn: async () => {
      const tokenPacksResponse = await supabase
        .from('token_packs')
        .select('*')
        .order('created_at', { ascending: false });

      if (tokenPacksResponse.error) {
        throw new Error(tokenPacksResponse.error.message);
      }

      const purchaseRequests = await callAdminFunction('admin-token-packs').then(
        (data: any) => data?.purchase_requests || []
      ).catch(() => []);

      return {
        token_packs: tokenPacksResponse.data || [],
        purchase_requests: purchaseRequests,
      };
    },
    staleTime: 5000,
  });

  const tokenPacks = data?.token_packs || [];
  const purchaseRequests = data?.purchase_requests || [];

  useEffect(() => {
    if (!isSubscribed) {
      const channels = [
        supabase
          .channel('admin-token-packs-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'token_packs',
            },
            (payload) => {
              queryClient.invalidateQueries({
                queryKey: ['admin', 'token-packs'],
              });
              refetch();
            }
          ),
        supabase
          .channel('admin-purchase-requests-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'token_pack_purchase_requests',
            },
            (payload) => {
              queryClient.invalidateQueries({
                queryKey: ['admin', 'token-packs'],
              });
              refetch();
            }
          ),
      ];

      channels.forEach(channel => {
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsSubscribed(true);
          }
        });
      });

      return () => {
        channels.forEach(channel => {
          channel.unsubscribe();
        });
      };
    }
  }, [isSubscribed, queryClient, refetch]);

  return {
    tokenPacks,
    purchaseRequests,
    isLoading,
    error: error as Error | null,
    refetch,
    isSubscribed,
  };
};
