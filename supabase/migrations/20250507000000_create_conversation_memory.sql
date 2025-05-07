
-- Create conversation memory table for storing chat history
CREATE TABLE IF NOT EXISTS public.conversation_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Add a unique constraint on user_id and session_id
  CONSTRAINT unique_user_session UNIQUE (user_id, session_id)
);

-- Enable RLS for the conversation_memory table
ALTER TABLE public.conversation_memory ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own conversation memory
CREATE POLICY "Users can view their own conversations" 
  ON public.conversation_memory 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own conversation memory
CREATE POLICY "Users can create their own conversations" 
  ON public.conversation_memory 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own conversation memory
CREATE POLICY "Users can update their own conversations" 
  ON public.conversation_memory 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX conversation_memory_user_id_idx ON public.conversation_memory (user_id);
CREATE INDEX conversation_memory_session_id_idx ON public.conversation_memory (session_id);
