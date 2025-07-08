-- Add missing adaptation_history column to growth_programs table
ALTER TABLE public.growth_programs 
ADD COLUMN adaptation_history JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.growth_programs.adaptation_history IS 'Stores the history of program adaptations and changes over time';