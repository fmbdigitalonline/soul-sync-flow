-- Fix the trigger to include ID generation
CREATE OR REPLACE FUNCTION initialize_user_intelligence()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO hacs_intelligence (
    id,
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
    gen_random_uuid(),
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

-- Also fix the insert for existing users
INSERT INTO hacs_intelligence (
  id,
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
  gen_random_uuid(),
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