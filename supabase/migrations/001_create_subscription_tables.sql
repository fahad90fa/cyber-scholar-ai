  -- Create subscription_plans table
  CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    monthly_price INTEGER NOT NULL,
    yearly_price INTEGER NOT NULL,
    tokens_per_month INTEGER NOT NULL,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    is_enterprise BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Create subscriptions table
  CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    plan_name TEXT NOT NULL,
    billing_cycle TEXT NOT NULL,
    price_paid INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    tokens_total INTEGER NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    started_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    cancelled_at TIMESTAMPTZ,
    cancel_reason TEXT,
    activated_by_admin BOOLEAN DEFAULT TRUE,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (status IN ('active', 'expired', 'cancelled'))
  );

  -- Create payment_requests table
  CREATE TABLE IF NOT EXISTS payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    plan_name TEXT NOT NULL,
    billing_cycle TEXT NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    transaction_reference TEXT,
    payment_date DATE,
    payment_screenshot_url TEXT,
    status TEXT DEFAULT 'pending',
    admin_notes TEXT,
    admin_confirmed_at TIMESTAMPTZ,
    admin_confirmed_by TEXT,
    rejection_reason TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_payment_status CHECK (status IN ('pending', 'confirmed', 'rejected', 'expired'))
  );

  -- Create token_transactions table
  CREATE TABLE IF NOT EXISTS token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    reason TEXT,
    balance_before INTEGER,
    balance_after INTEGER,
    admin_notes TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('purchase', 'usage', 'bonus', 'adjustment', 'compensation', 'penalty', 'refund'))
  );

  -- Create bank_settings table
  CREATE TABLE IF NOT EXISTS bank_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name TEXT,
    account_holder TEXT,
    account_number TEXT,
    iban TEXT,
    swift_bic TEXT,
    branch TEXT,
    country TEXT,
    additional_instructions TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Update profiles table
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id);
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tokens_total INTEGER DEFAULT 0;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tokens_reset_date DATE;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
  CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
  CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id ON payment_requests(user_id);
  CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
  CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);

  -- Insert default subscription plans
  INSERT INTO subscription_plans (name, slug, description, monthly_price, yearly_price, tokens_per_month, features, is_active, is_popular, sort_order) 
  VALUES 
    ('Starter', 'starter', 'Perfect for getting started', 4900, 47000, 80, '[
      "80 AI chat tokens per month",
      "Basic cybersecurity modules",
      "Email support",
      "Chat history 30 days",
      "1 custom training document"
    ]'::jsonb, TRUE, FALSE, 1),
    ('Pro', 'pro', 'For serious learners', 25000, 250000, 500, '[
      "500 AI chat tokens per month",
      "All cybersecurity modules",
      "Priority email support",
      "Unlimited chat history",
      "10 custom training documents",
      "Custom prompts",
      "Module progress tracking",
      "Priority AI responses"
    ]'::jsonb, TRUE, TRUE, 2),
    ('Pro Plus', 'pro_plus', 'Maximum power', 49900, 499000, 1500, '[
      "1500 AI chat tokens per month",
      "All cybersecurity modules",
      "24/7 priority support",
      "Unlimited chat history",
      "Unlimited custom training documents",
      "Custom prompts",
      "Module progress tracking",
      "Priority AI responses",
      "API access",
      "Team collaboration up to 3 users",
      "Early access to new features"
    ]'::jsonb, TRUE, FALSE, 3),
    ('Enterprise', 'enterprise', 'For organizations', 0, 0, 999999, '[
      "Unlimited AI tokens",
      "All features included",
      "Dedicated support",
      "Custom integrations",
      "Unlimited team members"
    ]'::jsonb, TRUE, FALSE, 4)
  ON CONFLICT (slug) DO NOTHING;

  -- Insert token packs
  CREATE TABLE IF NOT EXISTS token_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tokens INTEGER NOT NULL,
    price INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  INSERT INTO token_packs (name, tokens, price, is_active, sort_order)
  VALUES 
    ('50 tokens', 50, 3000, TRUE, 1),
    ('100 tokens', 100, 5500, TRUE, 2),
    ('250 tokens', 250, 12500, TRUE, 3)
  ON CONFLICT DO NOTHING;
