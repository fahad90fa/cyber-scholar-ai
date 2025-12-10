-- Fix the valid_request_status check constraint to allow 'confirmed' status
-- First, drop the old constraint
ALTER TABLE token_pack_requests 
DROP CONSTRAINT IF EXISTS valid_request_status;

-- Add the new constraint that allows the correct status values
ALTER TABLE token_pack_requests
ADD CONSTRAINT valid_request_status CHECK (status IN ('pending', 'confirmed', 'rejected', 'expired'));
