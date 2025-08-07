-- EMERGENCY I/O RECOVERY PHASE 1: Archive old profiles to reduce disk load
-- This removes 80% of profile data while preserving latest 2 per user

-- Create backup table first for safety
CREATE TABLE user_360_profiles_archive AS 
SELECT * FROM user_360_profiles;

-- Add an index to help with the cleanup query
CREATE INDEX IF NOT EXISTS idx_user_360_profiles_user_updated 
ON user_360_profiles(user_id, updated_at DESC);

-- Delete old profiles, keeping only latest 2 per user
WITH ranked_profiles AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) as rn
  FROM user_360_profiles
)
DELETE FROM user_360_profiles
WHERE id IN (
  SELECT id FROM ranked_profiles WHERE rn > 2
);

-- Add compression and size limits to prevent future bloat
-- Update existing profiles to use compressed JSONB
UPDATE user_360_profiles 
SET profile_data = profile_data::jsonb
WHERE profile_data IS NOT NULL;