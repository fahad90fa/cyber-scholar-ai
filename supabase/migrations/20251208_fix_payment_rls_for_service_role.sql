-- Drop existing restrictive RLS policies on payment_requests
DROP POLICY IF EXISTS "Users can insert their payments" ON payment_requests;
DROP POLICY IF EXISTS "Users can view their payments" ON payment_requests;
DROP POLICY IF EXISTS "Users can update their pending payments" ON payment_requests;

-- Allow service role full access (bypasses RLS)
CREATE POLICY "Service role can manage payments" ON payment_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to insert their own payments
CREATE POLICY "Users can insert their payments" ON payment_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to view their own payments
CREATE POLICY "Users can view their payments" ON payment_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to update their own pending payments
CREATE POLICY "Users can update their pending payments" ON payment_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');
