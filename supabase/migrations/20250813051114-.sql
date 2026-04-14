-- Add visibility field to course_runs table
ALTER TABLE public.course_runs 
ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public';

-- Add check constraint to ensure only valid values
ALTER TABLE public.course_runs 
ADD CONSTRAINT course_runs_visibility_check 
CHECK (visibility IN ('public', 'private'));