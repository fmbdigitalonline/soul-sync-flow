-- Create completely isolated database tables for each conversation mode
-- These are separate from existing hacs_* tables to ensure no breaking changes

-- Coach Mode Tables
CREATE TABLE public.hacs_coach_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  conversation_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  intelligence_level_start INTEGER DEFAULT 50,
  intelligence_level_end INTEGER,
  context_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.hacs_coach_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  intelligence_level REAL DEFAULT 50.0,
  interaction_count INTEGER DEFAULT 0,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  module_scores JSONB DEFAULT '{}'::jsonb,
  pie_score REAL DEFAULT 0,
  tmg_score REAL DEFAULT 0,
  vfp_score REAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.hacs_coach_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  conversation_id UUID REFERENCES hacs_coach_conversations(id),
  intelligence_level_when_asked INTEGER NOT NULL,
  generated_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  response_quality_score REAL DEFAULT 0.0,
  learning_value REAL DEFAULT 0.0,
  asked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_response TEXT,
  hacs_module TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL
);

-- Growth Mode Tables
CREATE TABLE public.hacs_growth_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  conversation_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  intelligence_level_start INTEGER DEFAULT 50,
  intelligence_level_end INTEGER,
  context_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.hacs_growth_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  intelligence_level REAL DEFAULT 50.0,
  interaction_count INTEGER DEFAULT 0,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  module_scores JSONB DEFAULT '{}'::jsonb,
  pie_score REAL DEFAULT 0,
  tmg_score REAL DEFAULT 0,
  vfp_score REAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.hacs_growth_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  conversation_id UUID REFERENCES hacs_growth_conversations(id),
  intelligence_level_when_asked INTEGER NOT NULL,
  generated_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  response_quality_score REAL DEFAULT 0.0,
  learning_value REAL DEFAULT 0.0,
  asked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_response TEXT,
  hacs_module TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL
);

-- Blend Mode Tables
CREATE TABLE public.hacs_blend_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  conversation_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  intelligence_level_start INTEGER DEFAULT 50,
  intelligence_level_end INTEGER,
  context_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.hacs_blend_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  intelligence_level REAL DEFAULT 50.0,
  interaction_count INTEGER DEFAULT 0,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  module_scores JSONB DEFAULT '{}'::jsonb,
  pie_score REAL DEFAULT 0,
  tmg_score REAL DEFAULT 0,
  vfp_score REAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.hacs_blend_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  conversation_id UUID REFERENCES hacs_blend_conversations(id),
  intelligence_level_when_asked INTEGER NOT NULL,
  generated_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  response_quality_score REAL DEFAULT 0.0,
  learning_value REAL DEFAULT 0.0,
  asked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_response TEXT,
  hacs_module TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL
);

-- Dream Mode Tables
CREATE TABLE public.hacs_dream_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  conversation_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  intelligence_level_start INTEGER DEFAULT 50,
  intelligence_level_end INTEGER,
  context_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.hacs_dream_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  intelligence_level REAL DEFAULT 50.0,
  interaction_count INTEGER DEFAULT 0,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  module_scores JSONB DEFAULT '{}'::jsonb,
  pie_score REAL DEFAULT 0,
  tmg_score REAL DEFAULT 0,
  vfp_score REAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.hacs_dream_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  conversation_id UUID REFERENCES hacs_dream_conversations(id),
  intelligence_level_when_asked INTEGER NOT NULL,
  generated_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  response_quality_score REAL DEFAULT 0.0,
  learning_value REAL DEFAULT 0.0,
  asked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_response TEXT,
  hacs_module TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL
);

-- Enable RLS on all new tables
ALTER TABLE public.hacs_coach_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hacs_coach_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hacs_coach_questions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.hacs_growth_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hacs_growth_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hacs_growth_questions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.hacs_blend_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hacs_blend_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hacs_blend_questions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.hacs_dream_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hacs_dream_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hacs_dream_questions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for Coach tables
CREATE POLICY "Users can manage their own coach conversations" ON hacs_coach_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own coach intelligence" ON hacs_coach_intelligence FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own coach questions" ON hacs_coach_questions FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for Growth tables
CREATE POLICY "Users can manage their own growth conversations" ON hacs_growth_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own growth intelligence" ON hacs_growth_intelligence FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own growth questions" ON hacs_growth_questions FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for Blend tables
CREATE POLICY "Users can manage their own blend conversations" ON hacs_blend_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own blend intelligence" ON hacs_blend_intelligence FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own blend questions" ON hacs_blend_questions FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for Dream tables
CREATE POLICY "Users can manage their own dream conversations" ON hacs_dream_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own dream intelligence" ON hacs_dream_intelligence FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own dream questions" ON hacs_dream_questions FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_hacs_coach_conversations_user_session ON hacs_coach_conversations(user_id, session_id);
CREATE INDEX idx_hacs_coach_intelligence_user ON hacs_coach_intelligence(user_id);
CREATE INDEX idx_hacs_coach_questions_user ON hacs_coach_questions(user_id);

CREATE INDEX idx_hacs_growth_conversations_user_session ON hacs_growth_conversations(user_id, session_id);
CREATE INDEX idx_hacs_growth_intelligence_user ON hacs_growth_intelligence(user_id);
CREATE INDEX idx_hacs_growth_questions_user ON hacs_growth_questions(user_id);

CREATE INDEX idx_hacs_blend_conversations_user_session ON hacs_blend_conversations(user_id, session_id);
CREATE INDEX idx_hacs_blend_intelligence_user ON hacs_blend_intelligence(user_id);
CREATE INDEX idx_hacs_blend_questions_user ON hacs_blend_questions(user_id);

CREATE INDEX idx_hacs_dream_conversations_user_session ON hacs_dream_conversations(user_id, session_id);
CREATE INDEX idx_hacs_dream_intelligence_user ON hacs_dream_intelligence(user_id);
CREATE INDEX idx_hacs_dream_questions_user ON hacs_dream_questions(user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_hacs_coach_conversations_updated_at BEFORE UPDATE ON hacs_coach_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hacs_coach_intelligence_updated_at BEFORE UPDATE ON hacs_coach_intelligence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hacs_growth_conversations_updated_at BEFORE UPDATE ON hacs_growth_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hacs_growth_intelligence_updated_at BEFORE UPDATE ON hacs_growth_intelligence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hacs_blend_conversations_updated_at BEFORE UPDATE ON hacs_blend_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hacs_blend_intelligence_updated_at BEFORE UPDATE ON hacs_blend_intelligence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hacs_dream_conversations_updated_at BEFORE UPDATE ON hacs_dream_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hacs_dream_intelligence_updated_at BEFORE UPDATE ON hacs_dream_intelligence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();