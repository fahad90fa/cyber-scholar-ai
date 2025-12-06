export interface AdminSession {
  authenticated: boolean;
  timestamp: number;
  expiresAt: number;
}

export interface AdminActivityLog {
  id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  target_user_id: string | null;
  target_user_email: string | null;
  old_value: any;
  new_value: any;
  note: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  pendingPayments: number;
  monthlyRevenue: number;
  totalRevenue: number;
  subscriptionsByTier: Record<string, number>;
}

export interface UserWithDetails {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: string | null;
  subscription_status: string | null;
  tokens_total: number;
  tokens_used: number;
  is_banned: boolean;
  created_at: string;
  subscription?: {
    plan_name: string;
    status: string;
    expires_at: string;
  };
}
