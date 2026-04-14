-- Add HRDC Program Code field to courses table
ALTER TABLE public.courses 
ADD COLUMN hrdc_program_code TEXT;