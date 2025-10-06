-- Add hermetic alignment context to productivity_journey table
ALTER TABLE productivity_journey 
ADD COLUMN IF NOT EXISTS hermetic_alignment_context JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN productivity_journey.hermetic_alignment_context IS 'Stores which hermetic data source was used (Hermetic 2.0, Hermetic 1.0 Report, Rich Blueprint) and depth score for journey creation';

-- Add agentic tool configuration storage
ALTER TABLE productivity_journey 
ADD COLUMN IF NOT EXISTS agentic_tool_config JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN productivity_journey.agentic_tool_config IS 'Configuration for agentic mini-tools and task assistance features';

-- Add personalization depth score
ALTER TABLE productivity_journey 
ADD COLUMN IF NOT EXISTS personalization_depth_score INTEGER DEFAULT 50;

COMMENT ON COLUMN productivity_journey.personalization_depth_score IS 'Score (0-100) indicating depth of personalization based on available data';

-- Create index for faster queries on hermetic alignment
CREATE INDEX IF NOT EXISTS idx_productivity_journey_hermetic_source 
ON productivity_journey ((hermetic_alignment_context->>'data_source'));

-- Update existing records to have baseline hermetic context
UPDATE productivity_journey 
SET hermetic_alignment_context = jsonb_build_object(
  'data_source', 'Basic Blueprint',
  'depth', 30,
  'migrated_at', NOW()
),
personalization_depth_score = 30
WHERE hermetic_alignment_context = '{}'::jsonb;