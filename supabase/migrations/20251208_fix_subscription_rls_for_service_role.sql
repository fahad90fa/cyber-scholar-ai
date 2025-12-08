-- Fix RLS policies for subscriptions table to allow service role
DROP POLICY IF EXISTS "Users can view their subscriptions" ON subscriptions;

-- Allow service role full access
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to view their own subscriptions
CREATE POLICY "Users can view their subscriptions" ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);


-- Fix RLS policies for token_transactions table
DROP POLICY IF EXISTS "Users can view their transactions" ON token_transactions;

-- Allow service role full access
CREATE POLICY "Service role can manage transactions" ON token_transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to view their own transactions
CREATE POLICY "Users can view their transactions" ON token_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
