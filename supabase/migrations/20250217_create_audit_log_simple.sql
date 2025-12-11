-- Simple audit_log table creation
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email_snapshot TEXT,
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL,
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS audit_log_event_type_idx ON public.audit_log(event_type);
CREATE INDEX IF NOT EXISTS audit_log_user_id_idx ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS audit_log_user_created_idx ON public.audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_created_idx ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_category_idx ON public.audit_log(event_category);

-- RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only service role can read audit logs" ON public.audit_log;
CREATE POLICY "Only service role can read audit logs"
  ON public.audit_log FOR SELECT
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Only service role can insert audit logs" ON public.audit_log;
CREATE POLICY "Only service role can insert audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
