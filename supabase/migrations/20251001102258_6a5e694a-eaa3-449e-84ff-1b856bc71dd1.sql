-- Update tax rate to 5%
UPDATE tax_settings 
SET tax_rate = 5, 
    updated_at = now() 
WHERE is_active = true;