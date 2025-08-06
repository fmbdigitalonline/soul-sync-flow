-- PHASE 3: Progressive Memory Infrastructure
-- Create structured message storage for scalability

-- Table for individual messages with rich metadata
CREATE TABLE public.conversation_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  thread_id UUID NOT NULL,
  message_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  agent_mode TEXT,
  semantic_embedding VECTOR(1536),
  topic_tags TEXT[],
  emotional_tone TEXT,
  importance_score REAL DEFAULT 5.0,
  parent_message_id TEXT,
  is_summary BOOLEAN DEFAULT FALSE,
  summary_level INTEGER DEFAULT 0,
  tokens_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own messages" 
ON public.conversation_messages 
FOR ALL 
USING (auth.uid() = user_id);

-- Table for conversation topics and branching
CREATE TABLE public.conversation_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  thread_id UUID NOT NULL,
  topic_name TEXT NOT NULL,
  topic_description TEXT,
  start_message_id TEXT NOT NULL,
  end_message_id TEXT,
  topic_embedding VECTOR(1536),
  confidence_score REAL DEFAULT 0.7,
  message_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversation_topics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own topics" 
ON public.conversation_topics 
FOR ALL 
USING (auth.uid() = user_id);

-- Table for conversation summaries at different levels
CREATE TABLE public.conversation_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  thread_id UUID NOT NULL,
  summary_level INTEGER NOT NULL, -- 1=immediate, 2=session, 3=topic, 4=long-term
  summary_content TEXT NOT NULL,
  message_range_start TEXT NOT NULL,
  message_range_end TEXT NOT NULL,
  topic_id UUID REFERENCES public.conversation_topics(id),
  key_insights TEXT[],
  emotional_arc TEXT,
  summary_embedding VECTOR(1536),
  compression_ratio REAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversation_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own summaries" 
ON public.conversation_summaries 
FOR ALL 
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_conversation_messages_thread_id ON public.conversation_messages(thread_id, created_at);
CREATE INDEX idx_conversation_messages_user_id ON public.conversation_messages(user_id, created_at);
CREATE INDEX idx_conversation_messages_embedding ON public.conversation_messages USING ivfflat (semantic_embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_conversation_messages_topic_tags ON public.conversation_messages USING GIN(topic_tags);

CREATE INDEX idx_conversation_topics_thread_id ON public.conversation_topics(thread_id, created_at);
CREATE INDEX idx_conversation_topics_embedding ON public.conversation_topics USING ivfflat (topic_embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_conversation_summaries_thread_id ON public.conversation_summaries(thread_id, summary_level);
CREATE INDEX idx_conversation_summaries_embedding ON public.conversation_summaries USING ivfflat (summary_embedding vector_cosine_ops) WITH (lists = 100);

-- Triggers for updated_at
CREATE TRIGGER update_conversation_messages_updated_at
  BEFORE UPDATE ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversation_topics_updated_at
  BEFORE UPDATE ON public.conversation_topics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversation_summaries_updated_at
  BEFORE UPDATE ON public.conversation_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();