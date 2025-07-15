-- Enable Row Level Security on hacs_intelligence_backup table
ALTER TABLE public.hacs_intelligence_backup ENABLE ROW LEVEL SECURITY;

-- Create policies for user access to hacs_intelligence_backup
CREATE POLICY "Users can view their own HACS intelligence backup" 
ON public.hacs_intelligence_backup 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own HACS intelligence backup" 
ON public.hacs_intelligence_backup 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own HACS intelligence backup" 
ON public.hacs_intelligence_backup 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);