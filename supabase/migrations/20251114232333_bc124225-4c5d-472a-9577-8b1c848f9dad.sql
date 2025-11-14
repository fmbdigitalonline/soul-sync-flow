-- Drop any public SELECT policies on memory_writeback_queue
DROP POLICY IF EXISTS "Anyone can view writeback queue" ON public.memory_writeback_queue;
DROP POLICY IF EXISTS "Public can view writeback queue" ON public.memory_writeback_queue;
DROP POLICY IF EXISTS "Users can view writeback queue items" ON public.memory_writeback_queue;

-- Ensure only service role can read the table (policy should already exist from previous migration)
-- If it doesn't exist, create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'memory_writeback_queue' 
    AND policyname = 'Only service role can read writeback items'
  ) THEN
    CREATE POLICY "Only service role can read writeback items"
      ON public.memory_writeback_queue
      FOR SELECT
      TO service_role
      USING (true);
  END IF;
END $$;