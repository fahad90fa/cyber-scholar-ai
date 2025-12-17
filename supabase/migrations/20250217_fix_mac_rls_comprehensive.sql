-- Comprehensive fix for MAC Address Bindings RLS policies
-- Ensures service role can properly INSERT, UPDATE, SELECT, and DELETE records

-- Drop all existing policies on mac_address_bindings
DROP POLICY IF EXISTS "Users can view own MAC bindings" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "Service role can manage all MAC bindings" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "Service role insert MAC bindings" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "Service role select MAC bindings" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "Service role update MAC bindings" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "Service role delete MAC bindings" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "Service role full access" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "Users can view own bindings" ON public.mac_address_bindings;

-- Drop all existing policies on mac_verification_log
DROP POLICY IF EXISTS "Users can view own verification logs" ON public.mac_verification_log;
DROP POLICY IF EXISTS "Service role can manage verification logs" ON public.mac_verification_log;
DROP POLICY IF EXISTS "Service role insert verification logs" ON public.mac_verification_log;
DROP POLICY IF EXISTS "Service role select verification logs" ON public.mac_verification_log;
DROP POLICY IF EXISTS "Service role update verification logs" ON public.mac_verification_log;
DROP POLICY IF EXISTS "Service role full access" ON public.mac_verification_log;
DROP POLICY IF EXISTS "Users can view own logs" ON public.mac_verification_log;

-- Ensure RLS is enabled on both tables
ALTER TABLE public.mac_address_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mac_verification_log ENABLE ROW LEVEL SECURITY;

-- ===== MAC Address Bindings Policies =====

-- Service role: Full access (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "mac_bindings_service_role_all"
  ON public.mac_address_bindings
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Authenticated users: Can view their own bindings
CREATE POLICY "mac_bindings_user_select_own"
  ON public.mac_address_bindings
  FOR SELECT
  USING (auth.uid() = user_id);

-- ===== MAC Verification Log Policies =====

-- Service role: Full access (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "mac_log_service_role_all"
  ON public.mac_verification_log
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Authenticated users: Can view their own verification logs
CREATE POLICY "mac_log_user_select_own"
  ON public.mac_verification_log
  FOR SELECT
  USING (auth.uid() = user_id);
 