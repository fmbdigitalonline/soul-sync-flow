
-- Create hot memory cache table for TMG system
CREATE TABLE IF NOT EXISTS public.hot_memory_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id text NOT NULL,
  cache_key text NOT NULL,
  content_hash text NOT NULL,
  raw_content jsonb NOT NULL DEFAULT '{}',
  importance_score real NOT NULL DEFAULT 5.0,
  access_count integer NOT NULL DEFAULT 1,
  last_accessed timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '1 hour'),
  CONSTRAINT hot_memory_cache_user_session_key UNIQUE (user_id, session_id, cache_key)
);

-- Create memory graph nodes table
CREATE TABLE IF NOT EXISTS public.memory_graph_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  node_type text NOT NULL CHECK (node_type IN ('entity', 'topic', 'summary', 'conversation', 'preference')),
  label text NOT NULL,
  properties jsonb NOT NULL DEFAULT '{}',
  importance_score real NOT NULL DEFAULT 5.0,
  schema_version integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create memory graph edges table
CREATE TABLE IF NOT EXISTS public.memory_graph_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  from_node_id uuid NOT NULL REFERENCES public.memory_graph_nodes(id) ON DELETE CASCADE,
  to_node_id uuid NOT NULL REFERENCES public.memory_graph_nodes(id) ON DELETE CASCADE,
  relationship_type text NOT NULL CHECK (relationship_type IN ('relates_to', 'mentions', 'likes', 'discussed_with', 'summary_of')),
  properties jsonb NOT NULL DEFAULT '{}',
  weight real NOT NULL DEFAULT 1.0,
  schema_version integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create memory deltas table for compression
CREATE TABLE IF NOT EXISTS public.memory_deltas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id text NOT NULL,
  delta_hash text NOT NULL,
  previous_hash text,
  delta_type text NOT NULL CHECK (delta_type IN ('conversation_turn', 'summary_update', 'node_change', 'schema_migration')),
  delta_data jsonb NOT NULL DEFAULT '{}',
  importance_score real NOT NULL DEFAULT 5.0,
  schema_version integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT memory_deltas_hash_unique UNIQUE (delta_hash)
);

-- Create memory metrics table for performance tracking
CREATE TABLE IF NOT EXISTS public.memory_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  memory_tier text NOT NULL CHECK (memory_tier IN ('hot', 'warm', 'cold')),
  access_type text NOT NULL CHECK (access_type IN ('hit', 'miss', 'write', 'eviction')),
  latency_ms real,
  session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create writeback queue table for async processing
CREATE TABLE IF NOT EXISTS public.memory_writeback_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_id text NOT NULL,
  operation_type text NOT NULL,
  queued_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hot_memory_cache_user_session ON public.hot_memory_cache(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_hot_memory_cache_expires ON public.hot_memory_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_memory_graph_nodes_user_type ON public.memory_graph_nodes(user_id, node_type);
CREATE INDEX IF NOT EXISTS idx_memory_graph_edges_user ON public.memory_graph_edges(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_graph_edges_from_to ON public.memory_graph_edges(from_node_id, to_node_id);
CREATE INDEX IF NOT EXISTS idx_memory_deltas_user_session ON public.memory_deltas(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_memory_deltas_hash_chain ON public.memory_deltas(previous_hash);
CREATE INDEX IF NOT EXISTS idx_memory_metrics_user_tier ON public.memory_metrics(user_id, memory_tier);
CREATE INDEX IF NOT EXISTS idx_writeback_queue_status ON public.memory_writeback_queue(status, queued_at);

-- Create cleanup function for expired hot memory entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_hot_memory()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.hot_memory_cache 
  WHERE expires_at < now();
END;
$$;

-- Create function to update access count and timestamp
CREATE OR REPLACE FUNCTION public.update_hot_memory_access()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.access_count = OLD.access_count + 1;
  NEW.last_accessed = now();
  RETURN NEW;
END;
$$;

-- Create trigger for hot memory access updates
CREATE TRIGGER hot_memory_access_trigger
  BEFORE UPDATE ON public.hot_memory_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_hot_memory_access();

-- Enable RLS on all tables (optional, can be configured later)
ALTER TABLE public.hot_memory_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_graph_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_deltas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_writeback_queue ENABLE ROW LEVEL SECURITY;
