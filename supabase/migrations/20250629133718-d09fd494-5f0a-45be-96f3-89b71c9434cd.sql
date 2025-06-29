
-- Enhance conversation_memory table for better growth program support
ALTER TABLE public.conversation_memory 
ADD COLUMN IF NOT EXISTS domain text,
ADD COLUMN IF NOT EXISTS conversation_stage text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS last_activity timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS recovery_context jsonb DEFAULT '{}'::jsonb;

-- Create index for faster conversation recovery
CREATE INDEX IF NOT EXISTS idx_conversation_memory_user_domain ON public.conversation_memory (user_id, domain, last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_memory_session_stage ON public.conversation_memory (session_id, conversation_stage);

-- Enable Row Level Security if not already enabled
ALTER TABLE public.conversation_memory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversation_memory;
DROP POLICY IF EXISTS "Users can create their own conversations" ON public.conversation_memory;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversation_memory;

-- Create policies for conversation memory access
CREATE POLICY "Users can view their own conversations" 
  ON public.conversation_memory 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
  ON public.conversation_memory 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
  ON public.conversation_memory 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create function to automatically update last_activity
CREATE OR REPLACE FUNCTION update_conversation_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic activity updates
DROP TRIGGER IF EXISTS trigger_update_conversation_activity ON public.conversation_memory;
CREATE TRIGGER trigger_update_conversation_activity
  BEFORE UPDATE ON public.conversation_memory
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_activity();
