-- Add chat security columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS chat_security_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS chat_password_hash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS chat_password_salt TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS chat_password_set_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS chat_security_hint TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS failed_chat_password_attempts INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS chat_locked_until TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_chat_access TIMESTAMPTZ;

-- Create chat security log table
CREATE TABLE IF NOT EXISTS public.chat_security_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS chat_security_log_user_idx ON public.chat_security_log(user_id);
CREATE INDEX IF NOT EXISTS chat_security_log_created_idx ON public.chat_security_log(created_at DESC);
CREATE INDEX IF NOT EXISTS chat_security_log_user_created_idx ON public.chat_security_log(user_id, created_at DESC);

-- Enable RLS on chat_security_log
ALTER TABLE public.chat_security_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own security logs
CREATE POLICY "Users can view own security logs"
  ON public.chat_security_log FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Service role can insert logs
CREATE POLICY "Service role can insert security logs"
  ON public.chat_security_log FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- Create RPC function to set chat password
CREATE OR REPLACE FUNCTION public.set_chat_password(
  p_user_id UUID,
  p_password_hash TEXT,
  p_password_salt TEXT,
  p_hint TEXT
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  UPDATE public.profiles
  SET 
    chat_password_hash = p_password_hash,
    chat_password_salt = p_password_salt,
    chat_security_enabled = TRUE,
    chat_security_hint = p_hint,
    chat_password_set_at = NOW(),
    failed_chat_password_attempts = 0,
    chat_locked_until = NULL
  WHERE id = p_user_id;
  
  RETURN QUERY SELECT TRUE, 'Chat password set successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function to complete onboarding
CREATE OR REPLACE FUNCTION public.complete_onboarding(
  p_user_id UUID
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  UPDATE public.profiles
  SET 
    onboarding_completed = TRUE,
    onboarding_completed_at = NOW()
  WHERE id = p_user_id;
  
  RETURN QUERY SELECT TRUE, 'Onboarding completed'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
