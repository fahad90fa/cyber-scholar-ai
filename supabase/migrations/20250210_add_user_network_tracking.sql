-- Create user_devices table (device/client tracking)
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_label TEXT,
  ip_current TEXT,
  ip_last_seen_at TIMESTAMPTZ,
  mac_address TEXT,
  last_lat DOUBLE PRECISION,
  last_lng DOUBLE PRECISION,
  location_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_ip_history table (IP address history)
CREATE TABLE IF NOT EXISTS user_ip_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip TEXT NOT NULL,
  ip_version TEXT CHECK (ip_version IN ('ipv4', 'ipv6')),
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  geo_country TEXT,
  geo_city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_ip_current ON user_devices(ip_current);
CREATE INDEX IF NOT EXISTS idx_user_ip_history_user_id ON user_ip_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ip_history_ip ON user_ip_history(ip);
CREATE INDEX IF NOT EXISTS idx_user_ip_history_last_seen ON user_ip_history(last_seen_at DESC);

-- RLS Policies: Admin-only access via service role
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ip_history ENABLE ROW LEVEL SECURITY;

-- Deny all access via anon key
DROP POLICY IF EXISTS "Deny anon access to user_devices" ON user_devices;
CREATE POLICY "Deny anon access to user_devices"
  ON user_devices
  AS RESTRICTIVE
  USING (FALSE);

DROP POLICY IF EXISTS "Deny anon access to user_ip_history" ON user_ip_history;
CREATE POLICY "Deny anon access to user_ip_history"
  ON user_ip_history
  AS RESTRICTIVE
  USING (FALSE);

-- Allow service role full access (used by Edge Functions)
DROP POLICY IF EXISTS "Service role access to user_devices" ON user_devices;
CREATE POLICY "Service role access to user_devices"
  ON user_devices
  AS PERMISSIVE
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role access to user_ip_history" ON user_ip_history;
CREATE POLICY "Service role access to user_ip_history"
  ON user_ip_history
  AS PERMISSIVE
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
