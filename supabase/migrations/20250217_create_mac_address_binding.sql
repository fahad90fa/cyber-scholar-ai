-- MAC Address Binding Table
-- Stores system MAC addresses for device fingerprinting and security verification
CREATE TABLE IF NOT EXISTS public.mac_address_bindings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mac_address TEXT NOT NULL,
  mac_checksum VARCHAR(64) NOT NULL,
  device_name TEXT,
  device_os TEXT,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  last_verified TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  verification_count INT DEFAULT 0,
  failed_verification_count INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS mac_bindings_user_id_idx ON public.mac_address_bindings(user_id);
CREATE INDEX IF NOT EXISTS mac_bindings_user_active_idx ON public.mac_address_bindings(user_id, is_active);
CREATE INDEX IF NOT EXISTS mac_bindings_mac_hash_idx ON public.mac_address_bindings(mac_checksum);
CREATE INDEX IF NOT EXISTS mac_bindings_created_idx ON public.mac_address_bindings(created_at DESC);
CREATE INDEX IF NOT EXISTS mac_bindings_last_seen_idx ON public.mac_address_bindings(last_seen DESC);

-- Unique constraint: one primary MAC per user
CREATE UNIQUE INDEX IF NOT EXISTS mac_bindings_user_primary_idx 
ON public.mac_address_bindings(user_id) 
WHERE is_active = TRUE;

-- MAC Verification Log Table
-- Tracks all MAC verification attempts for audit purposes
CREATE TABLE IF NOT EXISTS public.mac_verification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  binding_id UUID REFERENCES public.mac_address_bindings(id) ON DELETE SET NULL,
  mac_address TEXT,
  expected_mac TEXT,
  verification_status VARCHAR(20) NOT NULL,
  checksum_match BOOLEAN,
  ip_address TEXT,
  user_agent TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for verification log
CREATE INDEX IF NOT EXISTS mac_log_user_id_idx ON public.mac_verification_log(user_id);
CREATE INDEX IF NOT EXISTS mac_log_status_idx ON public.mac_verification_log(verification_status);
CREATE INDEX IF NOT EXISTS mac_log_created_idx ON public.mac_verification_log(created_at DESC);
CREATE INDEX IF NOT EXISTS mac_log_user_created_idx ON public.mac_verification_log(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.mac_address_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mac_verification_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mac_address_bindings
DROP POLICY IF EXISTS "Users can view own MAC bindings" ON public.mac_address_bindings;
CREATE POLICY "Users can view own MAC bindings"
  ON public.mac_address_bindings FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage all MAC bindings" ON public.mac_address_bindings;
CREATE POLICY "Service role can manage all MAC bindings"
  ON public.mac_address_bindings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- RLS Policies for mac_verification_log
DROP POLICY IF EXISTS "Users can view own verification logs" ON public.mac_verification_log;
CREATE POLICY "Users can view own verification logs"
  ON public.mac_verification_log FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage verification logs" ON public.mac_verification_log;
CREATE POLICY "Service role can manage verification logs"
  ON public.mac_verification_log FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_mac_bindings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_mac_bindings_updated_at_trigger ON public.mac_address_bindings;
CREATE TRIGGER update_mac_bindings_updated_at_trigger
  BEFORE UPDATE ON public.mac_address_bindings
  FOR EACH ROW
  EXECUTE FUNCTION update_mac_bindings_updated_at();
