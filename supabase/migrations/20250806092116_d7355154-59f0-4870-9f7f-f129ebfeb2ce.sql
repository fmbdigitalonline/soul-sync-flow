-- PHASE 2: Semantic Intelligence Infrastructure
-- Add embedding support to conversation memory

-- Create message embeddings table for semantic search
CREATE TABLE IF NOT EXISTS public.message_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimensions
  message_role TEXT NOT NULL,
  agent_mode TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.message_embeddings ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own message embeddings" 
ON public.message_embeddings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own message embeddings" 
ON public.message_embeddings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own message embeddings" 
ON public.message_embeddings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own message embeddings" 
ON public.message_embeddings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for efficient similarity search
CREATE INDEX IF NOT EXISTS idx_message_embeddings_user_session 
ON public.message_embeddings(user_id, session_id);

CREATE INDEX IF NOT EXISTS idx_message_embeddings_session 
ON public.message_embeddings(session_id);

-- Create vector similarity index for fast embedding search
CREATE INDEX IF NOT EXISTS idx_message_embeddings_vector 
ON public.message_embeddings 
USING ivfflat (embedding vector_cosine_ops);