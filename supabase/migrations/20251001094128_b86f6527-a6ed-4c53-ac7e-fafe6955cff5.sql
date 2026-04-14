-- Update tax rate to 0% for UAE operations
-- First, delete any existing tax settings
DELETE FROM public.tax_settings;

-- Insert new tax setting with 0% rate
INSERT INTO public.tax_settings (tax_rate, is_active)
VALUES (0, true);