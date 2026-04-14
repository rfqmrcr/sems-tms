-- Add QBO Invoice Number field to registrations table
ALTER TABLE public.registrations 
ADD COLUMN qbo_invoice_number TEXT;