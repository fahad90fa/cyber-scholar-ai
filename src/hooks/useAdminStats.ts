import { useQuery } from '@tanstack/react-query';
import { callAdminFunction } from '@/utils/adminApi';

export const useAdminStats = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      return callAdminFunction('admin-stats');
    },
  });

  return {
    totalUsers: stats?.total_users || 0,
    activeSubscriptions: stats?.active_subscriptions || {
      starter: 0,
      pro: 0,
      pro_plus: 0,
      enterprise: 0,
    },
    pendingPayments: stats?.pending_payments || 0,
    monthlyRevenue: stats?.monthly_revenue || 0,
    totalRevenue: stats?.total_revenue || 0,
    todaySignups: stats?.today_signups || 0,
    tokenUsage: stats?.token_usage || 0,
    isLoading,
    error: error as Error | null,
  };
};
