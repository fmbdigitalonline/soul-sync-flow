-- Step 7: Create conversation_messages table for optimistic message handling
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  client_msg_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'hacs', 'assistant')),
  content TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'error')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  correlation_id UUID, -- Step 6: Pipeline patching support
  pipeline_id TEXT,
  step_seq INTEGER,
  
  -- Step 7: Unique constraints for idempotency
  CONSTRAINT unique_user_message_per_conversation UNIQUE (conversation_id, client_msg_id) DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT unique_pipeline_step UNIQUE (correlation_id, pipeline_id, step_seq) DEFERRABLE INITIALLY DEFERRED
);

-- Enable Row Level Security
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own messages" 
ON public.conversation_messages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages" 
ON public.conversation_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" 
ON public.conversation_messages 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_conversation_messages_conversation_id ON public.conversation_messages(conversation_id);
CREATE INDEX idx_conversation_messages_session_id ON public.conversation_messages(session_id);
CREATE INDEX idx_conversation_messages_client_msg_id ON public.conversation_messages(client_msg_id);
CREATE INDEX idx_conversation_messages_correlation_id ON public.conversation_messages(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX idx_conversation_messages_created_at ON public.conversation_messages(created_at);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_conversation_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_conversation_messages_updated_at
  BEFORE UPDATE ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_messages_updated_at();