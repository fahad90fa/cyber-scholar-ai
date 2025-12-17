-- Fix RLS policies for MAC Address Bindings
-- Make sure service role can properly insert/update records

-- Drop all existing MAC bindings policies
DROP POLICY IF EXISTS "Users can view own MAC bindings" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "Service role can manage all MAC bindings" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "Service role insert MAC bindings" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "Service role select MAC bindings" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "Service role update MAC bindings" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "Service role delete MAC bindings" ON public.mac_address_bindings;

-- Create new explicit policies for service role (backend operations)
CREATE POLICY "Service role full access"
  ON public.mac_address_bindings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create policy for users to view their own bindings
CREATE POLICY "Users can view own bindings"
  ON public.mac_address_bindings FOR SELECT
  USING (auth.uid() = user_id);

-- Drop all existing verification log policies
DROP POLICY IF EXISTS "Users can view own verification logs" ON public.mac_verification_log;
DROP POLICY IF EXISTS "Service role can manage verification logs" ON public.mac_verification_log;
DROP POLICY IF EXISTS "Service role insert verification logs" ON public.mac_verification_log;
DROP POLICY IF EXISTS "Service role select verification logs" ON public.mac_verification_log;
DROP POLICY IF EXISTS "Service role update verification logs" ON public.mac_verification_log;

-- Create new explicit policies for verification log
CREATE POLICY "Service role full access"
  ON public.mac_verification_log FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create policy for users to view their own logs
CREATE POLICY "Users can view own logs"
  ON public.mac_verification_log FOR SELECT
  USING (auth.uid() = user_id);
