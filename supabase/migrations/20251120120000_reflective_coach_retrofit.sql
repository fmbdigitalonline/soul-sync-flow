-- Retrofit legacy PIE tables into Reflective Coach + Project Architect schema

-- 1. RETROFIT: pie_astrological_events -> conversational_context_events
-- We stop looking at stars and start looking at "Moments"
ALTER TABLE pie_astrological_events 
  RENAME TO conversational_context_events;

ALTER TABLE conversational_context_events
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES hacs_conversations(id),
  ADD COLUMN IF NOT EXISTS sentiment_score FLOAT,
  ADD COLUMN IF NOT EXISTS detected_intent TEXT,
  ADD COLUMN IF NOT EXISTS related_goal_id UUID;

-- 2. RETROFIT: pie_predictive_rules -> blueprint_logic_matrix
-- We replace astrology rules with User Blueprint rules
ALTER TABLE pie_predictive_rules 
  RENAME TO blueprint_logic_matrix;

ALTER TABLE blueprint_logic_matrix
  ADD COLUMN IF NOT EXISTS cognitive_profile_tag TEXT,
  ADD COLUMN IF NOT EXISTS trigger_condition JSONB;

-- 3. RETROFIT: pie_insights -> reflective_action_plans
-- Instead of text messages, we store actionable Project updates
ALTER TABLE pie_insights 
  RENAME TO reflective_action_plans;

ALTER TABLE reflective_action_plans
  ADD COLUMN IF NOT EXISTS proposed_actions JSONB,
  ADD COLUMN IF NOT EXISTS user_feedback_status TEXT;
