-- Add CME/Sales Representative field to registrations table
ALTER TABLE public.registrations 
ADD COLUMN cme_sales_representative TEXT CHECK (cme_sales_representative IN ('Isaac', 'Syafieq'));