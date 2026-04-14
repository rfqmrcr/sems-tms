-- Add start_time and end_time fields to course_runs table
ALTER TABLE public.course_runs 
ADD COLUMN start_time TIME NOT NULL DEFAULT '09:00:00',
ADD COLUMN end_time TIME NOT NULL DEFAULT '18:00:00';