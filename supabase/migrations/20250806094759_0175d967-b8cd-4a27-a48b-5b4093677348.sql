-- PHASE 2: Add similarity search function for semantic intelligence

-- Create PostgreSQL function for efficient vector similarity search
CREATE OR REPLACE FUNCTION search_similar_messages(
  query_embedding vector(1536),
  user_id_param uuid,
  max_results integer DEFAULT 10,
  similarity_threshold real DEFAULT 0.7
)
RETURNS TABLE (
  content text,
  message_role text,
  created_at timestamp with time zone,
  session_id text,
  agent_mode text,
  similarity real
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    me.content,
    me.message_role,
    me.created_at,
    me.session_id,
    me.agent_mode,
    1 - (me.embedding <=> query_embedding) as similarity
  FROM message_embeddings me
  WHERE 
    me.user_id = user_id_param
    AND (1 - (me.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY me.embedding <=> query_embedding
  LIMIT max_results;
$$;