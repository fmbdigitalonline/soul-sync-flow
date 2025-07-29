-- Fix the security issue with the vector similarity search function
DROP FUNCTION IF EXISTS public.match_blueprint_chunks(VECTOR, UUID, FLOAT, INT);

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
SET search_path = public
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