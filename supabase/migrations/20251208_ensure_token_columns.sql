-- Ensure all profiles have token columns initialized
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS tokens_total INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tokens_reset_date DATE;

-- Initialize tokens for users without subscription
UPDATE profiles
SET tokens_total = 20, tokens_used = 0, tokens_reset_date = CURRENT_DATE + INTERVAL '1 month'
WHERE tokens_total IS NULL OR tokens_total = 0;

-- Sync tokens from subscription for users with active subscriptions
UPDATE profiles p
SET tokens_total = s.tokens_total,
    tokens_used = s.tokens_used
FROM subscriptions s
WHERE p.id = s.user_id AND s.status = 'active';

-- Create index for faster token queries
CREATE INDEX IF NOT EXISTS idx_profiles_tokens ON profiles(id, tokens_total, tokens_used);

-- Create a function to sync tokens when subscription is created
CREATE OR REPLACE FUNCTION sync_tokens_on_subscription()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET tokens_total = NEW.tokens_total,
      tokens_used = NEW.tokens_used
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS sync_subscription_tokens ON subscriptions;
CREATE TRIGGER sync_subscription_tokens
AFTER INSERT OR UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION sync_tokens_on_subscription();
