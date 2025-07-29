-- Create blueprint text embeddings table for proper RAG architecture
CREATE TABLE public.blueprint_text_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chunk_content TEXT NOT NULL,
  embedding VECTOR(1536) NOT NULL, -- OpenAI embedding dimension
  source_report_id UUID REFERENCES public.personality_reports(id),
  chunk_index INTEGER NOT NULL,
  chunk_hash TEXT NOT NULL, -- For deduplication
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.blueprint_text_embeddings ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own blueprint embeddings" 
ON public.blueprint_text_embeddings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own blueprint embeddings" 
ON public.blueprint_text_embeddings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blueprint embeddings" 
ON public.blueprint_text_embeddings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blueprint embeddings" 
ON public.blueprint_text_embeddings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_blueprint_embeddings_user_id ON public.blueprint_text_embeddings(user_id);
CREATE INDEX idx_blueprint_embeddings_hash ON public.blueprint_text_embeddings(chunk_hash);

-- Create vector similarity search function
CREATE OR REPLACE FUNCTION public.match_blueprint_chunks(
  query_embedding VECTOR(1536),
  query_user_id UUID,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  chunk_content TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT 
    id,
    chunk_content,
    1 - (embedding <=> query_embedding) AS similarity
  FROM public.blueprint_text_embeddings
  WHERE user_id = query_user_id
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_blueprint_embeddings_updated_at
BEFORE UPDATE ON public.blueprint_text_embeddings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();