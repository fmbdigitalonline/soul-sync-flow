
-- Create a table for user dreams
CREATE TABLE public.user_dreams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  timeframe TEXT,
  importance_level TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own dreams
ALTER TABLE public.user_dreams ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own dreams
CREATE POLICY "Users can view their own dreams" 
  ON public.user_dreams 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own dreams
CREATE POLICY "Users can create their own dreams" 
  ON public.user_dreams 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own dreams
CREATE POLICY "Users can update their own dreams" 
  ON public.user_dreams 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own dreams
CREATE POLICY "Users can delete their own dreams" 
  ON public.user_dreams 
  FOR DELETE 
  USING (auth.uid() = user_id);
