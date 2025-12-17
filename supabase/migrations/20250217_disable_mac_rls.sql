-- Disable RLS on MAC tables (system tables, only accessed by backend service role)
-- These tables don't need row-level security since only the backend accesses them

ALTER TABLE public.mac_address_bindings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mac_verification_log DISABLE ROW LEVEL SECURITY;
