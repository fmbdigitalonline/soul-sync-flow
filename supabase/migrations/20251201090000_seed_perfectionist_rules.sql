-- Seed Perfectionist coaching heuristics in the blueprint_logic_matrix
-- These rules fuel the Reflective Bridge by teaching it how to respond
-- when Perfectionist users hit blockers or momentum gaps.

-- Clear existing global Perfectionist seeds to avoid duplicates when rerun
DELETE FROM blueprint_logic_matrix
WHERE user_id = 'global_rule'
  AND cognitive_profile_tag = 'Perfectionist';

INSERT INTO blueprint_logic_matrix (
  id,
  user_id,
  cognitive_profile_tag,
  event_type,
  confidence,
  trigger_condition,
  user_data_types,
  direction,
  magnitude,
  statistical_significance,
  window_hours,
  minimum_occurrences
) VALUES
-- Rule 1: The Perfectionist Blocker (High Anxiety + Start of Project)
(
  gen_random_uuid(),
  'global_rule',
  'Perfectionist',
  'conversation',
  0.9,
  '{"sentiment": "low", "intent": "planning", "keyword": "paralyzed", "phase": "start"}',
  '["sentiment", "intent", "keyword"]',
  'negative',
  0.8,
  0.95,
  24,
  1
),
-- Rule 2: The Momentum Builder (Boredom + Mid-Project)
(
  gen_random_uuid(),
  'global_rule',
  'Perfectionist',
  'conversation',
  0.8,
  '{"sentiment": "neutral", "intent": "status_check", "keyword": "stuck", "phase": "mid"}',
  '["sentiment", "velocity"]',
  'neutral',
  0.5,
  0.8,
  48,
  2
),
-- Rule 3: Scope Slice (Overwhelm by scope language)
(
  gen_random_uuid(),
  'global_rule',
  'Perfectionist',
  'conversation',
  0.82,
  '{"intent": "planning", "keyword": "scope", "symptom": "overwhelmed"}',
  '["intent", "keyword", "symptom"]',
  'negative',
  0.72,
  0.88,
  36,
  1
),
-- Rule 4: Deadline Freeze (fear of imperfect delivery)
(
  gen_random_uuid(),
  'global_rule',
  'Perfectionist',
  'conversation',
  0.85,
  '{"intent": "delivery", "keyword": "deadline", "sentiment": "anxious"}',
  '["intent", "keyword", "sentiment"]',
  'negative',
  0.77,
  0.9,
  24,
  1
),
-- Rule 5: Loop Breaker (revising the same task repeatedly)
(
  gen_random_uuid(),
  'global_rule',
  'Perfectionist',
  'conversation',
  0.78,
  '{"intent": "revision", "keyword": "again", "symptom": "looping"}',
  '["intent", "symptom"]',
  'negative',
  0.64,
  0.82,
  72,
  2
),
-- Rule 6: Quality Threshold (seeking perfect standard)
(
  gen_random_uuid(),
  'global_rule',
  'Perfectionist',
  'conversation',
  0.76,
  '{"keyword": "perfect", "sentiment": "uncertain", "intent": "quality_check"}',
  '["keyword", "intent", "sentiment"]',
  'negative',
  0.6,
  0.8,
  48,
  2
),
-- Rule 7: Risk Aversion (fear of mistakes stalls action)
(
  gen_random_uuid(),
  'global_rule',
  'Perfectionist',
  'conversation',
  0.81,
  '{"keyword": "mistake", "intent": "decision", "sentiment": "low"}',
  '["keyword", "intent", "sentiment"]',
  'negative',
  0.7,
  0.87,
  24,
  1
),
-- Rule 8: Progress Calibration (user downplays wins)
(
  gen_random_uuid(),
  'global_rule',
  'Perfectionist',
  'conversation',
  0.74,
  '{"keyword": "not enough", "sentiment": "neutral", "intent": "status_check"}',
  '["keyword", "sentiment"]',
  'neutral',
  0.55,
  0.78,
  72,
  2
),
-- Rule 9: Momentum Spark (user hints at excitement but hesitates)
(
  gen_random_uuid(),
  'global_rule',
  'Perfectionist',
  'conversation',
  0.79,
  '{"sentiment": "mixed", "intent": "planning", "keyword": "excited"}',
  '["sentiment", "intent"]',
  'positive',
  0.58,
  0.81,
  48,
  1
),
-- Rule 10: Support Request (explicit ask for guidance)
(
  gen_random_uuid(),
  'global_rule',
  'Perfectionist',
  'conversation',
  0.83,
  '{"intent": "help_request", "keyword": "need help", "sentiment": "anxious"}',
  '["intent", "keyword", "sentiment"]',
  'positive',
  0.66,
  0.85,
  24,
  1
);
