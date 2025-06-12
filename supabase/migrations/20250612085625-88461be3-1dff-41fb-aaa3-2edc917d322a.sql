
-- Add unique constraint on user_id for productivity_journey table
ALTER TABLE public.productivity_journey 
ADD CONSTRAINT productivity_journey_user_id_unique UNIQUE (user_id);

-- Add unique constraint on user_id for growth_journey table as well for consistency
ALTER TABLE public.growth_journey 
ADD CONSTRAINT growth_journey_user_id_unique UNIQUE (user_id);
