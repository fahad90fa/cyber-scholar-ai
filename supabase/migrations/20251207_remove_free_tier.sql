-- Remove Free Tier - Only Paid Subscribers Can Use AI

-- Update profiles default - NO subscription by default
ALTER TABLE public.profiles 
  ALTER COLUMN subscription_tier SET DEFAULT NULL;

ALTER TABLE public.profiles 
  ALTER COLUMN subscription_status SET DEFAULT NULL;

ALTER TABLE public.profiles 
  ALTER COLUMN tokens_total SET DEFAULT 0;

ALTER TABLE public.profiles 
  ALTER COLUMN tokens_used SET DEFAULT 0;

-- Update constraint to NOT include 'free'
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_subscription_tier_check 
  CHECK (subscription_tier IS NULL OR subscription_tier IN ('starter', 'pro', 'pro_plus', 'enterprise'));

-- Update existing free users to NULL (no subscription)
UPDATE public.profiles
SET 
  subscription_tier = NULL,
  subscription_status = NULL,
  tokens_total = 0,
  tokens_used = 0
WHERE subscription_tier = 'free' OR subscription_tier IS NULL;

-- Remove Free plan from subscription_plans
DELETE FROM public.subscription_plans WHERE slug = 'free';

-- Update handle_new_user trigger - No tokens for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    subscription_tier,
    subscription_status,
    tokens_total,
    tokens_used,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    NULL,  -- No subscription
    NULL,  -- No status
    0,     -- Zero tokens
    0,     -- Zero used
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
