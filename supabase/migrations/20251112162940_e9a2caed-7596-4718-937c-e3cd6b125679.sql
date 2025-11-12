-- Fix security issue: Restrict memory_writeback_queue write access to service role only
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can insert/update writeback queue items" ON public.memory_writeback_queue;
DROP POLICY IF EXISTS "Users can insert writeback queue items" ON public.memory_writeback_queue;
DROP POLICY IF EXISTS "Users can update writeback queue items" ON public.memory_writeback_queue;

-- Create new secure policies: Only service role can write
CREATE POLICY "Only service role can insert writeback items"
ON public.memory_writeback_queue
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Only service role can update writeback items"
ON public.memory_writeback_queue
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Only service role can delete writeback items"
ON public.memory_writeback_queue
FOR DELETE
TO service_role
USING (true);

-- Keep read access restricted to service role for internal operations
DROP POLICY IF EXISTS "Users can view their own writeback queue items" ON public.memory_writeback_queue;

CREATE POLICY "Only service role can read writeback items"
ON public.memory_writeback_queue
FOR SELECT
TO service_role
USING (true);