-- Enable Row Level Security on hacs_intelligence table
ALTER TABLE public.hacs_intelligence ENABLE ROW LEVEL SECURITY;

-- Create policies for user access to hacs_intelligence
CREATE POLICY "Users can view their own HACS intelligence" 
ON public.hacs_intelligence 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own HACS intelligence" 
ON public.hacs_intelligence 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own HACS intelligence" 
ON public.hacs_intelligence 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);