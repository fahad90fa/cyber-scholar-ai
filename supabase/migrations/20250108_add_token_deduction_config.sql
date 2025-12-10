-- Create table for token cost configuration
CREATE TABLE IF NOT EXISTS token_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_per_message DECIMAL DEFAULT 1.0,
  cost_per_character_response DECIMAL DEFAULT 0.0,
  enabled_per_message BOOLEAN DEFAULT true,
  enabled_per_character BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default configuration
INSERT INTO token_config (cost_per_message, enabled_per_message)
VALUES (1.0, true)
ON CONFLICT DO NOTHING;

-- Create function to get current token cost config
CREATE OR REPLACE FUNCTION get_token_config()
RETURNS TABLE (
  cost_per_message DECIMAL,
  cost_per_character_response DECIMAL,
  enabled_per_message BOOLEAN,
  enabled_per_character BOOLEAN
) AS $$
BEGIN
  RETURN QUERY SELECT 
    tc.cost_per_message,
    tc.cost_per_character_response,
    tc.enabled_per_message,
    tc.enabled_per_character
  FROM token_config tc
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create function to deduct tokens for chat usage
CREATE OR REPLACE FUNCTION deduct_chat_tokens(
  p_user_id UUID,
  p_message_text TEXT,
  p_response_text TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  tokens_deducted DECIMAL,
  new_used_amount INTEGER
) AS $$
DECLARE
  v_config RECORD;
  v_tokens_to_deduct DECIMAL := 0;
  v_profile_data RECORD;
  v_new_used INTEGER;
BEGIN
  -- Get token cost configuration
  SELECT * INTO v_config FROM get_token_config();
  
  -- Calculate tokens to deduct
  IF v_config.enabled_per_message THEN
    v_tokens_to_deduct := v_tokens_to_deduct + v_config.cost_per_message;
  END IF;
  
  IF v_config.enabled_per_character THEN
    v_tokens_to_deduct := v_tokens_to_deduct + (LENGTH(p_response_text) * v_config.cost_per_character_response);
  END IF;
  
  -- Get current profile data
  SELECT tokens_used, tokens_total INTO v_profile_data
  FROM profiles
  WHERE id = p_user_id;
  
  -- Deduct tokens
  UPDATE profiles
  SET tokens_used = tokens_used + CEIL(v_tokens_to_deduct)
  WHERE id = p_user_id
  RETURNING tokens_used INTO v_new_used;
  
  -- Log transaction
  INSERT INTO token_transactions (
    user_id,
    type,
    amount,
    balance_before,
    balance_after,
    reason
  ) VALUES (
    p_user_id,
    'usage',
    CEIL(v_tokens_to_deduct),
    (v_profile_data.tokens_total - v_profile_data.tokens_used),
    (v_profile_data.tokens_total - v_new_used),
    'Chat message usage'
  );
  
  RETURN QUERY SELECT 
    true,
    v_tokens_to_deduct,
    v_new_used;
END;
$$ LANGUAGE plpgsql;
