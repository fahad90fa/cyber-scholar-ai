export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthly_price: number;
  yearly_price: number;
  tokens_per_month: number;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  is_enterprise: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string | null;
  billing_cycle: 'monthly' | 'yearly';
  price_paid: number;
  currency: string;
  tokens_total: number;
  tokens_used: number;
  status: 'active' | 'expired' | 'cancelled';
  started_at: string | null;
  expires_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  activated_by_admin: boolean;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentRequest {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string | null;
  billing_cycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  transaction_reference: string | null;
  payment_date: string | null;
  payment_screenshot_url: string | null;
  status: 'pending' | 'confirmed' | 'rejected' | 'expired';
  admin_notes: string | null;
  confirmed_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface TokenTransaction {
  id: string;
  user_id: string;
  type: 'usage' | 'admin_add' | 'admin_remove' | 'subscription_reset' | 'token_pack_purchase';
  amount: number;
  balance_before: number;
  balance_after: number;
  reason: string | null;
  note: string | null;
  admin_action: boolean;
  created_at: string;
}

export interface TokenPack {
  id: string;
  name: string;
  tokens: number;
  price: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TokenPackRequest {
  id: string;
  user_id: string;
  token_pack_id: string;
  tokens: number;
  amount: number;
  transaction_reference: string | null;
  payment_date: string | null;
  payment_screenshot_url: string | null;
  status: 'pending' | 'confirmed' | 'rejected' | 'expired';
  admin_notes: string | null;
  confirmed_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankSettings {
  id: string;
  bank_name: string | null;
  account_holder: string | null;
  account_number: string | null;
  iban: string | null;
  swift_code: string | null;
  branch_name: string | null;
  country: string | null;
  additional_instructions: string | null;
  support_email: string | null;
  payment_timeout_hours: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: string | null;
  subscription_status: string | null;
  subscription_id: string | null;
  tokens_total: number;
  tokens_used: number;
  tokens_reset_date: string | null;
  is_banned: boolean;
  banned_at: string | null;
  ban_reason: string | null;
  created_at: string;
  updated_at: string;
}

export type BillingCycle = 'monthly' | 'yearly';
