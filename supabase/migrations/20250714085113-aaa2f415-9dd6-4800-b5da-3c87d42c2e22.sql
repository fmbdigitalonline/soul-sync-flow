-- Phase 2: Add auto-initialization trigger for new users
-- This ensures every user automatically gets an intelligence record

CREATE OR REPLACE FUNCTION initialize_user_intelligence()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO hacs_intelligence (
    user_id, 
    intelligence_level, 
    interaction_count,
    last_update,
    module_scores,
    pie_score,
    tmg_score,
    vfp_score,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    50, -- starting intelligence level
    0,
    NOW(),
    '{}',
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
  ) ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on user creation
CREATE TRIGGER on_user_intelligence_init
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_intelligence();

-- Also ensure all existing users have intelligence records
INSERT INTO hacs_intelligence (
  user_id, 
  intelligence_level, 
  interaction_count,
  last_update,
  module_scores,
  pie_score,
  tmg_score,
  vfp_score,
  created_at,
  updated_at
)
SELECT 
  au.id,
  50,
  0,
  NOW(),
  '{}',
  NULL,
  NULL,
  NULL,
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN hacs_intelligence hi ON au.id = hi.user_id
WHERE hi.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;