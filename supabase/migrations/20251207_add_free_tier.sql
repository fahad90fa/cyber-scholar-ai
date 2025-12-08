-- Add FREE tier to subscription_plans
INSERT INTO subscription_plans (name, slug, description, monthly_price, yearly_price, tokens_per_month, features, is_active, is_popular, sort_order) 
VALUES 
  ('Free', 'free', 'Perfect for testing the platform', 0, 0, 20, '[
    "20 AI chat tokens per month",
    "Basic cybersecurity modules",
    "7 days chat history",
    "1 training document upload",
    "Community support",
    "Educational use only"
  ]'::jsonb, TRUE, FALSE, 0)
ON CONFLICT (slug) DO NOTHING;

-- Update profiles table to add bonus tokens column if not exists
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS bonus_tokens INTEGER DEFAULT 0;

-- Update profiles table to add tokens reset date if not exists
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS tokens_reset_date DATE DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')::DATE;

-- Update default values for new users
ALTER TABLE profiles ALTER COLUMN subscription_tier SET DEFAULT 'free';
ALTER TABLE profiles ALTER COLUMN tokens_total SET DEFAULT 20;
ALTER TABLE profiles ALTER COLUMN tokens_used SET DEFAULT 0;

-- Update subscription_tier constraint to include 'free'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_tier_check 
  CHECK (subscription_tier IS NULL OR subscription_tier IN ('free', 'starter', 'pro', 'pro_plus', 'enterprise'));

-- Update subscriptions status constraint to include 'free'
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE subscriptions ADD CONSTRAINT valid_status 
  CHECK (status IN ('active', 'expired', 'cancelled'));

-- Create trigger to automatically assign FREE tier to new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, subscription_tier, tokens_total, tokens_used, bonus_tokens, tokens_reset_date)
  VALUES (
    NEW.id, 
    NEW.email, 
    'free',
    20,
    0,
    0,
    (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')::DATE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new auth users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
