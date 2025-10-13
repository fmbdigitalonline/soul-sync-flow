-- ============================================================
-- PERSISTENCE FIX: Create conversation_state_tracking table
-- SoulSync Protocol: ADDON ONLY - No breaking changes
-- ============================================================

-- Table to persist conversation state detection results from companion-oracle-conversation
CREATE TABLE IF NOT EXISTS public.conversation_state_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  message_id UUID,
  
  -- State detection results from ConversationPhaseTracker
  cluster TEXT NOT NULL,
  sub_state TEXT NOT NULL,
  confidence REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  
  -- Signal breakdown for analysis
  signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  paralinguistic_count INTEGER DEFAULT 0,
  sentence_form_count INTEGER DEFAULT 0,
  discourse_marker_count INTEGER DEFAULT 0,
  cluster_pattern_count INTEGER DEFAULT 0,
  
  -- Opening rule tracking from schema
  opening_rule TEXT,
  allowed_next_clusters TEXT[] DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Performance indexes
CREATE INDEX idx_state_user_session ON public.conversation_state_tracking(user_id, session_id);
CREATE INDEX idx_state_cluster ON public.conversation_state_tracking(cluster);
CREATE INDEX idx_state_created ON public.conversation_state_tracking(created_at DESC);

-- Row Level Security
ALTER TABLE public.conversation_state_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own state tracking"
  ON public.conversation_state_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert state tracking"
  ON public.conversation_state_tracking FOR INSERT
  WITH CHECK (true);

-- Logging for verification
DO $$
BEGIN
  RAISE NOTICE '✅ PERSISTENCE FIX: conversation_state_tracking table created successfully';
  RAISE NOTICE '   - Captures 9 conversation clusters from ConversationPhaseTracker';
  RAISE NOTICE '   - Stores signal breakdown and confidence scores';
  RAISE NOTICE '   - RLS enabled for user privacy';
END $$;