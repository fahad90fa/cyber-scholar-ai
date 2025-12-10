-- Add checksum and file size to training_documents
ALTER TABLE training_documents
ADD COLUMN IF NOT EXISTS checksum_sha256 TEXT,
ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- Add index for integrity verification lookups
CREATE INDEX IF NOT EXISTS idx_training_documents_checksum 
ON training_documents(user_id, checksum_sha256);

-- Add index for file_size queries
CREATE INDEX IF NOT EXISTS idx_training_documents_file_size 
ON training_documents(user_id, file_size);

-- Add security_events table for integrity violations
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  description TEXT,
  severity TEXT DEFAULT 'warning',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for security_events
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own security events"
  ON security_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Index for security queries
CREATE INDEX IF NOT EXISTS idx_security_events_user 
ON security_events(user_id, created_at DESC);
