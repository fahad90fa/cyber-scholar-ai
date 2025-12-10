-- Create a function to update profile tokens when token pack request is confirmed
CREATE OR REPLACE FUNCTION handle_token_pack_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update on INSERT or UPDATE when status becomes 'confirmed'
  IF (NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed')) THEN
    -- Update the user's subscription tokens
    UPDATE subscriptions
    SET tokens_total = tokens_total + NEW.tokens
    WHERE user_id = NEW.user_id AND status = 'active';
    
    -- Also update the profile tokens_total
    UPDATE profiles
    SET tokens_total = tokens_total + NEW.tokens
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to handle token pack confirmations
DROP TRIGGER IF EXISTS token_pack_confirmation_trigger ON token_pack_requests;

CREATE TRIGGER token_pack_confirmation_trigger
AFTER UPDATE ON token_pack_requests
FOR EACH ROW
EXECUTE FUNCTION handle_token_pack_confirmation();
