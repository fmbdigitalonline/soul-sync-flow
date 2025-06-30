
-- Add Row Level Security policies for memory_metrics table
-- This is the CRITICAL fix - without these policies, all metric recording fails
CREATE POLICY "Users can insert their own memory metrics" 
  ON public.memory_metrics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own memory metrics" 
  ON public.memory_metrics 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Add RLS policies for other TMG tables that might be missing them
CREATE POLICY "Users can insert their own hot memory cache" 
  ON public.hot_memory_cache 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own hot memory cache" 
  ON public.hot_memory_cache 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own hot memory cache" 
  ON public.hot_memory_cache 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hot memory cache" 
  ON public.hot_memory_cache 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Memory graph nodes policies
CREATE POLICY "Users can insert their own memory graph nodes" 
  ON public.memory_graph_nodes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own memory graph nodes" 
  ON public.memory_graph_nodes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own memory graph nodes" 
  ON public.memory_graph_nodes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Memory graph edges policies
CREATE POLICY "Users can insert their own memory graph edges" 
  ON public.memory_graph_edges 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own memory graph edges" 
  ON public.memory_graph_edges 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Memory deltas policies
CREATE POLICY "Users can insert their own memory deltas" 
  ON public.memory_deltas 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own memory deltas" 
  ON public.memory_deltas 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Memory writeback queue policies (broader access for system operations)
CREATE POLICY "Users can insert writeback queue items" 
  ON public.memory_writeback_queue 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can view writeback queue items" 
  ON public.memory_writeback_queue 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can update writeback queue items" 
  ON public.memory_writeback_queue 
  FOR UPDATE 
  USING (true);
