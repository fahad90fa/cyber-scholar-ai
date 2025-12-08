-- Fix missing profiles for users that exist in auth.users
-- This resolves the foreign key constraint violation when creating payment requests

-- Enable RLS for payment_requests if not already enabled
ALTER TABLE IF EXISTS payment_requests ENABLE ROW LEVEL SECURITY;

-- Allow service role to bypass RLS for this operation
DROP POLICY IF EXISTS "Service role can manage payments" ON payment_requests;
CREATE POLICY "Service role can manage payments" ON payment_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Drop existing RLS policies on profiles temporarily to allow inserts
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Allow service role to manage profiles
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;
CREATE POLICY "Service role can manage profiles" ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create profiles for auth.users that don't have profiles yet
INSERT INTO profiles (id, email, full_name)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data ->> 'full_name', u.email) as full_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
  AND u.deleted_at IS NULL
ON CONFLICT (id) DO NOTHING;

-- Recreate user-facing RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
