-- Create token_pack_requests table
CREATE TABLE IF NOT EXISTS token_pack_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token_pack_id UUID NOT NULL REFERENCES token_packs(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_request_status CHECK (status IN ('pending', 'completed', 'rejected'))
);

-- Create indexes for token_pack_requests
CREATE INDEX IF NOT EXISTS idx_token_pack_requests_user_id ON token_pack_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_token_pack_requests_token_pack_id ON token_pack_requests(token_pack_id);
CREATE INDEX IF NOT EXISTS idx_token_pack_requests_status ON token_pack_requests(status);

-- Drop ALL RLS policies from subscription tables (admin access will be controlled via admin token in edge functions)
DROP POLICY IF EXISTS "Public can view active plans" ON subscription_plans;
DROP POLICY IF EXISTS "Authenticated can view active plans" ON subscription_plans;
DROP POLICY IF EXISTS "Users can view their subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Authenticated can insert subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Authenticated can update subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admin can create subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admin can update subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view their payments" ON payment_requests;
DROP POLICY IF EXISTS "Authenticated can create payments" ON payment_requests;
DROP POLICY IF EXISTS "Authenticated can update payments" ON payment_requests;
DROP POLICY IF EXISTS "Users can create payments" ON payment_requests;
DROP POLICY IF EXISTS "Admin can update payments" ON payment_requests;
DROP POLICY IF EXISTS "Users can view their transactions" ON token_transactions;
DROP POLICY IF EXISTS "Authenticated can create transactions" ON token_transactions;
DROP POLICY IF EXISTS "Admin can create transactions" ON token_transactions;
DROP POLICY IF EXISTS "Admin can view bank settings" ON bank_settings;
DROP POLICY IF EXISTS "Authenticated can view bank settings" ON bank_settings;
DROP POLICY IF EXISTS "Admin can update bank settings" ON bank_settings;
DROP POLICY IF EXISTS "Authenticated can update bank settings" ON bank_settings;
DROP POLICY IF EXISTS "Admin can insert bank settings" ON bank_settings;
DROP POLICY IF EXISTS "Authenticated can insert bank settings" ON bank_settings;
DROP POLICY IF EXISTS "Public can view token packs" ON token_packs;
DROP POLICY IF EXISTS "Authenticated can view token packs" ON token_packs;
DROP POLICY IF EXISTS "Admin can manage token packs" ON token_packs;
DROP POLICY IF EXISTS "Authenticated can manage token packs" ON token_packs;
DROP POLICY IF EXISTS "Users can view their token requests" ON token_pack_requests;
DROP POLICY IF EXISTS "Users can create token requests" ON token_pack_requests;
DROP POLICY IF EXISTS "Authenticated can create token requests" ON token_pack_requests;
DROP POLICY IF EXISTS "Admin can manage token requests" ON token_pack_requests;
DROP POLICY IF EXISTS "Authenticated can manage token requests" ON token_pack_requests;

-- Disable RLS on admin tables (authorization handled via admin token in edge functions)
ALTER TABLE IF EXISTS subscription_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS token_packs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bank_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS token_pack_requests DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled on user-sensitive tables
ALTER TABLE IF EXISTS subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS token_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions - Users view their own, admins can manage via edge functions
DROP POLICY IF EXISTS "Users can view their subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Authenticated can insert subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Authenticated can update subscriptions" ON subscriptions;

CREATE POLICY "Users can view their subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for payment_requests - Users view their own, admins can manage via edge functions
DROP POLICY IF EXISTS "Users can view their payments" ON payment_requests;
DROP POLICY IF EXISTS "Authenticated can create payments" ON payment_requests;
DROP POLICY IF EXISTS "Authenticated can update payments" ON payment_requests;

CREATE POLICY "Users can view their payments" ON payment_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their payments" ON payment_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for token_transactions - Users view their own only
DROP POLICY IF EXISTS "Users can view their transactions" ON token_transactions;
DROP POLICY IF EXISTS "Authenticated can create transactions" ON token_transactions;

CREATE POLICY "Users can view their transactions" ON token_transactions
  FOR SELECT USING (auth.uid() = user_id);
