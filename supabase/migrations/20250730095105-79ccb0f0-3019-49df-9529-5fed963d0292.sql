-- Create the missing match_blueprint_chunks function for Oracle RAG pipeline
-- This function performs vector similarity search on blueprint text embeddings
-- Following Pillar II: Operating on Ground Truth with real vector calculations

CREATE OR REPLACE FUNCTION public.match_blueprint_chunks(
  query_embedding vector(1536),
  query_user_id uuid,
  match_threshold double precision DEFAULT 0.3,
  match_count integer DEFAULT 5
)
RETURNS TABLE(
  id uuid,
  chunk_content text,
  similarity double precision
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
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

-- Add helpful comment for future developers
COMMENT ON FUNCTION public.match_blueprint_chunks IS 'Performs vector similarity search on blueprint text embeddings for Oracle RAG pipeline. Returns semantically similar chunks with cosine similarity scores.';