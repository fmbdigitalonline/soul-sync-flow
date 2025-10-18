-- Fix RLS policies for embedding_processing_jobs table
-- Use DO block to safely drop and recreate policies

DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Service role can manage embedding jobs" ON embedding_processing_jobs;
  DROP POLICY IF EXISTS "Users can view own embedding jobs" ON embedding_processing_jobs;
  DROP POLICY IF EXISTS "Users can view their own embedding jobs" ON embedding_processing_jobs;
  DROP POLICY IF EXISTS "Users can insert their own embedding jobs" ON embedding_processing_jobs;
  DROP POLICY IF EXISTS "Users can update their own embedding jobs" ON embedding_processing_jobs;
END $$;

-- Create secure policies that restrict access to user's own records
CREATE POLICY "Users can view their own embedding jobs"
  ON embedding_processing_jobs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own embedding jobs"
  ON embedding_processing_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own embedding jobs"
  ON embedding_processing_jobs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add comment for documentation
COMMENT ON TABLE embedding_processing_jobs IS 'Tracks background embedding processing jobs. RLS restricts access to user''s own records only. Service role bypasses RLS for system operations.';