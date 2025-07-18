
-- Create the 360° user profiles table for unified data storage
CREATE TABLE public.user_360_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profile_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  data_sources TEXT[] NOT NULL DEFAULT '{}',
  data_availability JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.user_360_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own 360 profiles" 
  ON public.user_360_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own 360 profiles" 
  ON public.user_360_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own 360 profiles" 
  ON public.user_360_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create index for efficient user lookups
CREATE INDEX idx_user_360_profiles_user_id ON public.user_360_profiles(user_id);
CREATE INDEX idx_user_360_profiles_last_updated ON public.user_360_profiles(last_updated);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_360_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update timestamp
CREATE TRIGGER update_user_360_profiles_updated_at
  BEFORE UPDATE ON public.user_360_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_360_profiles_updated_at();
