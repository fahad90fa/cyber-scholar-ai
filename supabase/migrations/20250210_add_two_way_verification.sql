-- Add two-way checksum verification fields to training_documents
ALTER TABLE training_documents
ADD COLUMN IF NOT EXISTS client_checksum TEXT,
ADD COLUMN IF NOT EXISTS checksum_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_timestamp TIMESTAMP WITH TIME ZONE;

-- Add index for two-way verification lookups
CREATE INDEX IF NOT EXISTS idx_training_documents_two_way_verification 
ON training_documents(user_id, checksum_verified, verification_timestamp DESC);

-- Add verification mismatch log table
CREATE TABLE IF NOT EXISTS checksum_verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  document_id TEXT,
  filename TEXT,
  verification_type TEXT, -- 'one_way', 'two_way', 'download_verify'
  verification_status TEXT, -- 'success', 'mismatch', 'error'
  client_checksum TEXT,
  server_checksum TEXT,
  similarity_percentage INTEGER,
  tamper_detected BOOLEAN DEFAULT FALSE,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for verification logs
ALTER TABLE checksum_verification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own verification logs" ON checksum_verification_logs;
CREATE POLICY "Users can view own verification logs"
  ON checksum_verification_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create index for verification log queries
CREATE INDEX IF NOT EXISTS idx_checksum_verification_logs_user 
ON checksum_verification_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_checksum_verification_logs_tamper
ON checksum_verification_logs(user_id, tamper_detected) 
WHERE tamper_detected = TRUE;

-- Add admin access policy for logs
DROP POLICY IF EXISTS "Admins can view all verification logs" ON checksum_verification_logs;
CREATE POLICY "Admins can view all verification logs"
  ON checksum_verification_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
