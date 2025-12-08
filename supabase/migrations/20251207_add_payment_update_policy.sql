-- Add UPDATE RLS policy for payment_requests (users can update their own pending payments)
CREATE POLICY "Users can update their pending payments" ON payment_requests
  FOR UPDATE 
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');
