-- Add updated_at column to registrations table (the trigger already exists)
ALTER TABLE public.registrations 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now());