-- PHASE 1: Data Population - Create default retrieval configs for existing users
INSERT INTO retrieval_config (user_id, sidecar_enabled, hybrid_retrieval_enabled, ann_thresholds, facts_priority)
SELECT 
  user_id,
  true as sidecar_enabled,
  true as hybrid_retrieval_enabled,
  ARRAY[0.25, 0.2] as ann_thresholds,
  true as facts_priority
FROM user_blueprints 
WHERE is_active = true
  AND user_id NOT IN (SELECT user_id FROM retrieval_config)
ON CONFLICT (user_id) DO NOTHING;