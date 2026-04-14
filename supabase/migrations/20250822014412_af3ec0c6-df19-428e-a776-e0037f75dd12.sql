-- Update default tax rate to 8%
UPDATE public.tax_settings 
SET tax_rate = 8 
WHERE is_active = true;

-- Update the table default for future inserts
ALTER TABLE public.tax_settings 
ALTER COLUMN tax_rate SET DEFAULT 8;