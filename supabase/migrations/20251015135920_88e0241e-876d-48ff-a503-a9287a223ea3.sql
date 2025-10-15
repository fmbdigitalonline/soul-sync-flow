-- Create facet-aware semantic search function for blueprint embeddings
CREATE OR REPLACE FUNCTION match_blueprint_chunks_with_facets(
  query_embedding vector(1536),
  query_user_id uuid,
  facet_filter text[] DEFAULT NULL,
  tag_filter text[] DEFAULT NULL,
  match_threshold double precision DEFAULT 0.3,
  match_count integer DEFAULT 10
)
RETURNS TABLE(
  id uuid,
  chunk_content text,
  facet text,
  heading text,
  tags text[],
  paragraph_index integer,
  similarity double precision
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    chunk_content,
    facet,
    heading,
    tags,
    paragraph_index,
    1 - (embedding <=> query_embedding) AS similarity
  FROM blueprint_text_embeddings
  WHERE user_id = query_user_id
    AND (facet_filter IS NULL OR facet = ANY(facet_filter))
    AND (tag_filter IS NULL OR tags && tag_filter)
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;