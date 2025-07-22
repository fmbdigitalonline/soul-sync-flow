-- Phase 3: Reset steward introduction for testing the complete flow
-- This is for validation purposes only

UPDATE blueprints 
SET steward_introduction_completed = false,
    updated_at = now()
WHERE user_id = 'fa7e1307-6a94-4520-b241-7bfb3c943c50'::uuid 
  AND is_active = true;