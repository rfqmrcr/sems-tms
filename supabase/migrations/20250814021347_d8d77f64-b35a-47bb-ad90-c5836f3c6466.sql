-- Add registration closing days to course runs table
ALTER TABLE public.course_runs 
ADD COLUMN registration_close_days INTEGER DEFAULT 7;