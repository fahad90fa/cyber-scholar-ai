import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Profile, Subscription, SubscriptionPlan } from '@/types/subscription.types';

export const useSubscription = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSubscription();
    } else {
      setProfile(null);
      setSubscription(null);
      setLoading(false);
    }
    fetchPlans();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    setProfile(data);
  };

  const fetchSubscription = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    // @ts-ignore - billing_cycle type mismatch
    setSubscription(data);
    setLoading(false);
  };

  const fetchPlans = async () => {
    const { data } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    // @ts-ignore - features type mismatch
    setPlans(data || []);
  };

  const hasActiveSubscription = (): boolean => {
    if (!subscription) return false;
    if (subscription.status !== 'active') return false;
    if (subscription.expires_at && new Date(subscription.expires_at) < new Date()) return false;
    return true;
  };

  const getTokensRemaining = (): number => {
    if (!profile) return 0;
    return Math.max(0, profile.tokens_total - profile.tokens_used);
  };

  const canUseAI = (): boolean => {
    return hasActiveSubscription() && getTokensRemaining() > 0;
  };

  return {
    profile,
    subscription,
    plans,
    loading,
    hasActiveSubscription,
    getTokensRemaining,
    canUseAI,
    refetch: () => {
      fetchProfile();
      fetchSubscription();
    },
  };
};
