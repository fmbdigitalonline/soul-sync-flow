-- Create conversation_insights table for storing generated insights from shadow pattern detection
CREATE TABLE IF NOT EXISTS conversation_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  insight_type TEXT NOT NULL,
  insight_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE conversation_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own insights
CREATE POLICY "Users can view their own insights"
  ON conversation_insights FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: System can insert insights (for edge functions)
CREATE POLICY "System can insert insights"
  ON conversation_insights FOR INSERT
  WITH CHECK (true);

-- Index for performance on common queries
CREATE INDEX idx_conversation_insights_user_created 
  ON conversation_insights(user_id, created_at DESC);

-- Index for querying unviewed insights
CREATE INDEX idx_conversation_insights_unviewed
  ON conversation_insights(user_id, viewed_at) 
  WHERE viewed_at IS NULL;