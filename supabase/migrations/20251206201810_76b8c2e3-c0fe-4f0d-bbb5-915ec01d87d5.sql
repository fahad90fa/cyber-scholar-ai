
-- Create profiles table for user subscription data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT,
  subscription_status TEXT,
  subscription_id UUID,
  tokens_total INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  tokens_reset_date DATE,
  is_banned BOOLEAN DEFAULT FALSE,
  banned_at TIMESTAMPTZ,
  ban_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  monthly_price INTEGER NOT NULL,
  yearly_price INTEGER NOT NULL,
  tokens_per_month INTEGER NOT NULL,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  is_enterprise BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  plan_name TEXT,
  billing_cycle TEXT,
  price_paid INTEGER,
  currency TEXT DEFAULT 'USD',
  tokens_total INTEGER,
  tokens_used INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  activated_by_admin BOOLEAN DEFAULT TRUE,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment_requests table
CREATE TABLE public.payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  plan_name TEXT,
  billing_cycle TEXT,
  amount INTEGER,
  currency TEXT DEFAULT 'USD',
  transaction_reference TEXT,
  payment_date DATE,
  payment_screenshot_url TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  confirmed_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create token_transactions table
CREATE TABLE public.token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  balance_before INTEGER,
  balance_after INTEGER,
  reason TEXT,
  note TEXT,
  admin_action BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create token_packs table
CREATE TABLE public.token_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tokens INTEGER NOT NULL,
  price INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create token_pack_requests table
CREATE TABLE public.token_pack_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_pack_id UUID REFERENCES public.token_packs(id),
  tokens INTEGER,
  amount INTEGER,
  transaction_reference TEXT,
  payment_date DATE,
  payment_screenshot_url TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  confirmed_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bank_settings table
CREATE TABLE public.bank_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT,
  account_holder TEXT,
  account_number TEXT,
  iban TEXT,
  swift_code TEXT,
  branch_name TEXT,
  country TEXT,
  additional_instructions TEXT,
  support_email TEXT,
  payment_timeout_hours INTEGER DEFAULT 48,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_activity_log table
CREATE TABLE public.admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  target_user_id UUID,
  target_user_email TEXT,
  old_value JSONB,
  new_value JSONB,
  note TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_pack_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans FOR SELECT USING (is_active = true);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for payment_requests
CREATE POLICY "Users can view own payment requests" ON public.payment_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own payment requests" ON public.payment_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for token_transactions
CREATE POLICY "Users can view own token transactions" ON public.token_transactions FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for token_packs (public read)
CREATE POLICY "Anyone can view active token packs" ON public.token_packs FOR SELECT USING (is_active = true);

-- RLS Policies for token_pack_requests
CREATE POLICY "Users can view own token pack requests" ON public.token_pack_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own token pack requests" ON public.token_pack_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for bank_settings (public read)
CREATE POLICY "Anyone can view bank settings" ON public.bank_settings FOR SELECT USING (true);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update profiles updated_at trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update subscriptions updated_at trigger
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, slug, description, monthly_price, yearly_price, tokens_per_month, features, is_popular, sort_order) VALUES
('Starter', 'starter', 'Perfect for beginners learning cybersecurity', 4900, 47000, 80, '["80 AI chat tokens per month", "Basic cybersecurity modules", "Email support", "Chat history 30 days", "1 custom training document"]', false, 1),
('Pro', 'pro', 'For serious security professionals', 25000, 250000, 500, '["500 AI chat tokens per month", "All cybersecurity modules", "Priority email support", "Unlimited chat history", "10 custom training documents", "Custom prompts", "Module progress tracking", "Priority AI responses"]', true, 2),
('Pro Plus', 'pro_plus', 'Advanced features for power users', 49900, 499000, 1500, '["1500 AI chat tokens per month", "All cybersecurity modules", "24/7 priority support", "Unlimited chat history", "Unlimited custom training documents", "Custom prompts", "Module progress tracking", "Priority AI responses", "API access", "Team collaboration up to 3 users", "Early access to new features"]', false, 3),
('Enterprise', 'enterprise', 'Custom solutions for organizations', 0, 0, 999999, '["Unlimited AI tokens", "All features included", "Dedicated support", "Custom integrations", "Unlimited team members"]', false, 4);

-- Update enterprise plan to be enterprise type
UPDATE public.subscription_plans SET is_enterprise = true WHERE slug = 'enterprise';

-- Insert default token packs
INSERT INTO public.token_packs (name, tokens, price, sort_order) VALUES
('Small Pack', 50, 3000, 1),
('Medium Pack', 100, 5500, 2),
('Large Pack', 250, 12500, 3);

-- Insert default bank settings
INSERT INTO public.bank_settings (bank_name, account_holder, account_number, iban, swift_code, branch_name, country, support_email, additional_instructions) VALUES
('Your Bank Name', 'Your Company Name', '1234567890', 'XX00 0000 0000 0000 0000 00', 'XXXXXXXX', 'Main Branch', 'United States', 'support@cybersecai.com', 'Please include your payment reference in the transfer description.');
