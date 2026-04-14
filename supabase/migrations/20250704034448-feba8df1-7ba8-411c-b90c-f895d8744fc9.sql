
-- Add payment_type column to registrations table
ALTER TABLE public.registrations 
ADD COLUMN payment_type text;
