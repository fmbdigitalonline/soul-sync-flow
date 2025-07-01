
-- Enable Row Level Security on encoder_versions table
-- This will activate the existing policy "Anyone can view encoder versions"
ALTER TABLE public.encoder_versions ENABLE ROW LEVEL SECURITY;
