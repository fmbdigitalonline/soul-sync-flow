
-- Fix 3: Add composite index for hot_memory_cache lookups
CREATE INDEX IF NOT EXISTS idx_hot_memory_active_lookup 
  ON hot_memory_cache (user_id, session_id, expires_at DESC);
