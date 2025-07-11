-- Create the HACS learning system database tables

-- Table for storing full conversation history
CREATE TABLE public.hacs_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  conversation_data JSONB NOT NULL DEFAULT '[]',
  context_summary TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  intelligence_level_start INTEGER DEFAULT 50,
  intelligence_level_end INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table for tracking generated questions and responses
CREATE TABLE public.hacs_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.hacs_conversations(id) ON DELETE CASCADE,
  hacs_module TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'foundational', 'validation', 'integration', 'philosophical'
  intelligence_level_when_asked INTEGER NOT NULL,
  generated_context JSONB NOT NULL DEFAULT '{}',
  user_response TEXT,
  response_quality_score REAL DEFAULT 0.0,
  learning_value REAL DEFAULT 0.0,
  asked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table for storing user feedback on suggestions and questions
CREATE TABLE public.hacs_learning_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.hacs_conversations(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.hacs_questions(id) ON DELETE CASCADE,
  message_id TEXT, -- For HACS messages from hacs-autonomous-text
  feedback_type TEXT NOT NULL, -- 'helpful', 'not_helpful', 'rating', 'preference'
  feedback_value JSONB NOT NULL DEFAULT '{}', -- Stores ratings, preferences, etc.
  feedback_text TEXT,
  module_affected TEXT,
  intelligence_impact REAL DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table for tracking module-specific insights and learning gaps
CREATE TABLE public.hacs_module_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hacs_module TEXT NOT NULL,
  insight_type TEXT NOT NULL, -- 'gap_identified', 'pattern_learned', 'preference_discovered'
  insight_data JSONB NOT NULL DEFAULT '{}',
  confidence_score REAL DEFAULT 0.0,
  validation_count INTEGER DEFAULT 0,
  last_validated TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table for learning optimal interaction patterns
CREATE TABLE public.hacs_interaction_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL, -- 'timing', 'communication_style', 'question_preference'
  pattern_data JSONB NOT NULL DEFAULT '{}',
  success_rate REAL DEFAULT 0.0,
  sample_size INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.hacs_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hacs_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hacs_learning_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hacs_module_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hacs_interaction_patterns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for hacs_conversations
CREATE POLICY "Users can manage their own conversations" ON public.hacs_conversations
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for hacs_questions
CREATE POLICY "Users can manage their own questions" ON public.hacs_questions
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for hacs_learning_feedback
CREATE POLICY "Users can manage their own feedback" ON public.hacs_learning_feedback
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for hacs_module_insights
CREATE POLICY "Users can manage their own insights" ON public.hacs_module_insights
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for hacs_interaction_patterns
CREATE POLICY "Users can manage their own patterns" ON public.hacs_interaction_patterns
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_hacs_conversations_user_session ON public.hacs_conversations(user_id, session_id);
CREATE INDEX idx_hacs_questions_user_module ON public.hacs_questions(user_id, hacs_module);
CREATE INDEX idx_hacs_feedback_user_type ON public.hacs_learning_feedback(user_id, feedback_type);
CREATE INDEX idx_hacs_insights_user_module ON public.hacs_module_insights(user_id, hacs_module);
CREATE INDEX idx_hacs_patterns_user_type ON public.hacs_interaction_patterns(user_id, pattern_type);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hacs_conversations_updated_at
  BEFORE UPDATE ON public.hacs_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hacs_module_insights_updated_at
  BEFORE UPDATE ON public.hacs_module_insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();