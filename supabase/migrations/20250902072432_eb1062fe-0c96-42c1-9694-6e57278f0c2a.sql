-- Add structured_intelligence column to personality_reports table to store the 13 intelligence analyses
ALTER TABLE personality_reports 
ADD COLUMN structured_intelligence JSONB DEFAULT '{}';

-- Add comment to document the column purpose
COMMENT ON COLUMN personality_reports.structured_intelligence IS 'Contains detailed intelligence analysis from 13 specialized agents, approximately 45,000+ words of personalized insights';