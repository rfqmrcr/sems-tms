-- Add price field to courses table
ALTER TABLE public.courses 
ADD COLUMN price NUMERIC(10,2);