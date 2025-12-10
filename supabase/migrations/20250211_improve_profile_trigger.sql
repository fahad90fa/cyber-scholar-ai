-- IMPROVED PROFILE TRIGGER WITH BETTER ERROR HANDLING
-- This replaces the handle_new_user function with improved error handling

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_result RECORD;
BEGIN
  INSERT INTO public.profiles (
    id,
    onboarding_completed,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING
  RETURNING * INTO v_result;
  
  IF v_result IS NOT NULL THEN
    RAISE NOTICE 'Profile created for user: %', new.id;
  ELSE
    RAISE NOTICE 'Profile already exists for user: %', new.id;
  END IF;
  
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error creating profile for user % - Code: % - Message: %', 
    new.id, SQLSTATE, SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure trigger exists and is up to date
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
