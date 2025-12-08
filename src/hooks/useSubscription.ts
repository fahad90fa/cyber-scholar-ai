import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';
import { apiClient } from '@/services/api';
import { useEffect, useState } from 'react';
import React from 'react';

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  billing_cycle: 'monthly' | 'yearly';
  status: 'active' | 'expired' | 'cancelled';
  tokens_total: number;
  tokens_used: number;
  started_at: string;
  expires_at: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  tokens_per_month: number;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  is_enterprise?: boolean;
  sort_order: number;
}

interface SubscriptionState {
  subscription: Subscription | null;
  isLoading: boolean;
  error: Error | null;
  hasActiveSubscription: boolean;
  subscriptionTier: string | null;
  tokensRemaining: number;
  isExpired: boolean;
  daysUntilExpiry: number;
  plans?: SubscriptionPlan[];
  loading?: boolean;
}

export const useSubscription = (): SubscriptionState & { refetchSubscription: () => Promise<any> } => {
  const { user } = useAuthContext();
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        const response = await apiClient.get('/auth/profile');
        console.debug('Profile fetched:', response);
        return response as any;
      } catch (error: any) {
        console.debug('Profile fetch error:', error?.message);
        return null;
      }
    },
    enabled: !!user?.id,
    retry: 2,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 1,
  });

  const { data: subscriptions = [], isLoading: subscriptionsLoading, refetch: refetchSubs } = useQuery({
    queryKey: ['subscriptions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const response = await apiClient.get('/subscriptions/current');
        console.debug('Current subscription fetched:', response);
        return response ? [response] : [];
      } catch (error: any) {
        console.debug('Subscriptions fetch error:', error?.message);
        return [];
      }
    },
    enabled: !!user?.id,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 10,
  });
  
  const refetchSubscription = async () => {
    console.debug('Refetching subscription data...');
    await Promise.all([
      refetchProfile(),
      refetchSubs(),
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] }),
      queryClient.invalidateQueries({ queryKey: ['subscriptions', user?.id] }),
    ]);
  };

  useEffect(() => {
    const initProfileIfNeeded = async () => {
      if (user?.id && profile === null && !profileLoading && !isInitializing) {
        setIsInitializing(true);
        try {
          await apiClient.post('/auth/init-profile');
          await new Promise(resolve => setTimeout(resolve, 500));
          await refetchProfile();
        } catch (error: any) {
          const errorMsg = error?.message || String(error);
          if (errorMsg.includes('23503') || errorMsg.includes('foreign key constraint')) {
            console.debug("Profile sync skipped - user not fully synced to Supabase yet");
          } else {
            console.debug("Profile initialization info:", errorMsg);
          }
          setIsInitializing(false);
        }
      }
    };

    if (user?.id) {
      initProfileIfNeeded();
    }
  }, [user?.id, profile, profileLoading, refetchProfile, isInitializing]);

  useEffect(() => {
    if (!isSubscribed && user?.id) {
      const channels = [
        supabase
          .channel('user-profile-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${user.id}`,
            },
            (payload) => {
              queryClient.invalidateQueries({
                queryKey: ['profile', user.id],
              });
            }
          ),
        supabase
          .channel('user-subscription-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'subscriptions',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              queryClient.invalidateQueries({
                queryKey: ['profile', user.id],
              });
              queryClient.invalidateQueries({
                queryKey: ['subscriptions', user.id],
              });
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
  }, [isSubscribed, user?.id, queryClient]);

  const subscription: Subscription | null = subscriptions?.[0] || null;

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/subscription-plans');
        return response as SubscriptionPlan[];
      } catch (error: any) {
        console.debug('Plans fetch error:', error?.message);
        return [];
      }
    },
    staleTime: 1000 * 60 * 30,
  });

  const activeSubscriptionFromDb = subscriptions?.some(
    (sub) => sub.status === 'active' && new Date(sub.expires_at) > new Date()
  );

  const hasActiveSubscription = Boolean(
    (profile?.subscription_tier &&
    profile?.subscription_status === 'active' &&
    ['starter', 'pro', 'pro_plus', 'enterprise'].includes(profile.subscription_tier)) ||
    activeSubscriptionFromDb
  );

  const tokensRemaining = Math.max(0, (profile?.tokens_total || 0) - (profile?.tokens_used || 0));

  const isExpired = subscription ? new Date(subscription.expires_at) < new Date() : true;

  const daysUntilExpiry = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const isLoading = profileLoading || subscriptionsLoading;
  const loading = plansLoading || isLoading;

  return {
    subscription: subscription || null,
    isLoading,
    error: profileError as Error | null,
    hasActiveSubscription: hasActiveSubscription && !isExpired,
    subscriptionTier: profile?.subscription_tier || 'free',
    tokensRemaining,
    isExpired,
    daysUntilExpiry,
    plans,
    loading,
    refetchSubscription,
  };
};
