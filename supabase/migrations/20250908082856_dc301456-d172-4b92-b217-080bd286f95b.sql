-- Add language preference to user profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en';

-- Create index for faster language preference lookups
CREATE INDEX IF NOT EXISTS idx_profiles_language_preference ON public.profiles(language_preference);

-- Update RLS policies to allow users to update their own language preference
-- This should already be covered by existing policies, but let's ensure it's explicit
CREATE POLICY IF NOT EXISTS "Users can update their own language preference" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);