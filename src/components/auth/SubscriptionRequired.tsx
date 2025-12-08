import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { PaywallModal } from '@/components/subscription/PaywallModal';

interface SubscriptionRequiredProps {
  children: React.ReactNode;
  showPaywall?: boolean;
}

export const SubscriptionRequired: React.FC<SubscriptionRequiredProps> = ({
  children,
  showPaywall = true,
}) => {
  const { user, loading: authLoading } = useAuthContext();
  const { hasActiveSubscription, isLoading: subLoading, subscriptionTier, refetchSubscription } = useSubscription();
  const [paywallOpen, setPaywallOpen] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchSubscription?.();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (authLoading || subLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasActiveSubscription) {
    if (showPaywall) {
      return (
        <PaywallModal
          open={paywallOpen}
          onClose={() => setPaywallOpen(false)}
          canClose={true}
          title="Subscription Required"
          message="You need an active subscription to access AI features. Choose a plan to get started."
          onRefresh={handleRefresh}
        />
      );
    } else {
      return <Navigate to="/pricing" replace />;
    }
  }

  return <>{children}</>;
};
