-- Fix memory storage RLS policies to allow service role writes
-- This allows edge functions to store memories on behalf of users

-- Add service role policies for hot_memory_cache
CREATE POLICY "Service role can manage hot memory cache"
  ON hot_memory_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add service role policies for user_session_memory
CREATE POLICY "Service role can manage session memory"
  ON user_session_memory
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add service role policies for memory_deltas
CREATE POLICY "Service role can manage memory deltas"
  ON memory_deltas
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add service role policies for memory_metrics
CREATE POLICY "Service role can manage memory metrics"
  ON memory_metrics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add logging to verify policies are working
COMMENT ON POLICY "Service role can manage hot memory cache" ON hot_memory_cache IS 
  'Allows edge functions using service role to store memories on behalf of users';