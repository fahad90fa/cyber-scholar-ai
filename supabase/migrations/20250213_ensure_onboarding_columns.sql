-- Ensure onboarding columns exist (for existing installations)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed 
  ON public.profiles(onboarding_completed);

CREATE INDEX IF NOT EXISTS idx_profiles_id_onboarding 
  ON public.profiles(id, onboarding_completed);
