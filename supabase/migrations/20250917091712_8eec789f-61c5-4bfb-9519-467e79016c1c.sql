-- Add the 6 new intelligence dimensions to hermetic_structured_intelligence table
-- Following existing pattern: JSONB columns with '{}' default, NOT NULL

ALTER TABLE public.hermetic_structured_intelligence 
ADD COLUMN cognitive_functions JSONB NOT NULL DEFAULT '{}',
ADD COLUMN career_vocational JSONB NOT NULL DEFAULT '{}',
ADD COLUMN health_wellness JSONB NOT NULL DEFAULT '{}',
ADD COLUMN compatibility JSONB NOT NULL DEFAULT '{}',
ADD COLUMN financial_archetype JSONB NOT NULL DEFAULT '{}',
ADD COLUMN karmic_patterns JSONB NOT NULL DEFAULT '{}';