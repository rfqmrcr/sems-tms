-- Drop the existing check constraint on percentage column
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS promo_codes_percentage_check;

-- Add a new check constraint that only validates percentages when type is 'percentage'
ALTER TABLE promo_codes ADD CONSTRAINT promo_codes_percentage_check 
  CHECK (
    (type = 'percentage' AND percentage >= 0 AND percentage <= 100) 
    OR 
    (type = 'fixed_amount' AND percentage > 0)
  );