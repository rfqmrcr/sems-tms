-- Add Category field to courses table
ALTER TABLE public.courses 
ADD COLUMN category TEXT;