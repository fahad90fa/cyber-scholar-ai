-- Force fix for MAC Address Bindings RLS - explicit policy names to avoid conflicts

-- Disable RLS temporarily to clear all policies
ALTER TABLE public.mac_address_bindings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mac_verification_log DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.mac_address_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mac_verification_log ENABLE ROW LEVEL SECURITY;

-- Drop ALL policies on mac_address_bindings (using IF EXISTS multiple times for safety)
DROP POLICY IF EXISTS "Users can view own MAC bindings" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "Service role can manage all MAC bindings" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "Service role insert MAC bindings" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "Service role select MAC bindings" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "Service role update MAC bindings" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "Service role delete MAC bindings" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "Service role full access" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "Users can view own bindings" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "mac_bindings_service_role_all" ON public.mac_address_bindings;
DROP POLICY IF EXISTS "mac_bindings_user_select_own" ON public.mac_address_bindings;

-- Drop ALL policies on mac_verification_log
DROP POLICY IF EXISTS "Users can view own verification logs" ON public.mac_verification_log;
DROP POLICY IF EXISTS "Service role can manage verification logs" ON public.mac_verification_log;
DROP POLICY IF EXISTS "Service role insert verification logs" ON public.mac_verification_log;
DROP POLICY IF EXISTS "Service role select verification logs" ON public.mac_verification_log;
DROP POLICY IF EXISTS "Service role update verification logs" ON public.mac_verification_log;
DROP POLICY IF EXISTS "Service role full access" ON public.mac_verification_log;
DROP POLICY IF EXISTS "Users can view own logs" ON public.mac_verification_log;
DROP POLICY IF EXISTS "mac_log_service_role_all" ON public.mac_verification_log;
DROP POLICY IF EXISTS "mac_log_user_select_own" ON public.mac_verification_log;

-- Create SINGLE, CLEAR policy for mac_address_bindings: Service role can do everything
CREATE POLICY "mac_bindings_allow_service_role_all"
  ON public.mac_address_bindings
  AS PERMISSIVE
  FOR ALL
  TO authenticated, anon, service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create policy for authenticated users to view their own bindings
CREATE POLICY "mac_bindings_allow_user_read_own"
  ON public.mac_address_bindings
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create SINGLE, CLEAR policy for mac_verification_log: Service role can do everything
CREATE POLICY "mac_log_allow_service_role_all"
  ON public.mac_verification_log
  AS PERMISSIVE
  FOR ALL
  TO authenticated, anon, service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create policy for authenticated users to view their own logs
CREATE POLICY "mac_log_allow_user_read_own"
  ON public.mac_verification_log
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
