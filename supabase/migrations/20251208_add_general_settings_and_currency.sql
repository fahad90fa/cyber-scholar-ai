-- Add currency column to bank_settings if it doesn't exist
ALTER TABLE bank_settings ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Add bonus_tokens column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bonus_tokens INTEGER DEFAULT 0;

-- Create general_settings table
CREATE TABLE IF NOT EXISTS general_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  support_email TEXT,
  payment_confirmation_timeout_hours INTEGER DEFAULT 48,
  auto_expire_pending_payments BOOLEAN DEFAULT FALSE,
  token_rollover_enabled BOOLEAN DEFAULT FALSE,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set RLS policies for bank_settings and general_settings
ALTER TABLE bank_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read bank and general settings
CREATE POLICY "Allow all authenticated users to read bank_settings" ON bank_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to read general_settings" ON general_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for admin access via edge functions (no auth required for edge functions)
CREATE POLICY "Allow service role to manage bank_settings" ON bank_settings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to manage general_settings" ON general_settings
  FOR ALL USING (auth.role() = 'service_role');
