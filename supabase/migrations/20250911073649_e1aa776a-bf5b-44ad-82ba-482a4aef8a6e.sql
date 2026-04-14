-- Add sponsorship type filter to promo codes table
ALTER TABLE public.promo_codes 
ADD COLUMN sponsorship_type_filter text DEFAULT 'both' CHECK (sponsorship_type_filter IN ('corporate', 'self', 'both'));

-- Update the validate_promo_code function to include sponsorship type checking
CREATE OR REPLACE FUNCTION public.validate_promo_code(
    code_input text, 
    course_visibility text DEFAULT 'public',
    sponsorship_type text DEFAULT NULL
)
RETURNS TABLE(is_valid boolean, discount_percentage numeric, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    promo_record RECORD;
BEGIN
    -- Find the promo code
    SELECT * INTO promo_record
    FROM public.promo_codes
    WHERE code = code_input
    AND is_active = true
    AND valid_from <= CURRENT_DATE
    AND valid_until >= CURRENT_DATE
    AND (course_visibility_filter = 'both' OR course_visibility_filter = course_visibility)
    AND (sponsorship_type_filter = 'both' OR sponsorship_type_filter = sponsorship_type OR sponsorship_type IS NULL);
    
    -- Check if code exists and is valid
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0::NUMERIC, 'Invalid, expired, or not applicable for this registration type'::TEXT;
        RETURN;
    END IF;
    
    -- Check usage limit
    IF promo_record.usage_limit IS NOT NULL AND promo_record.usage_count >= promo_record.usage_limit THEN
        RETURN QUERY SELECT false, 0::NUMERIC, 'Promo code usage limit exceeded'::TEXT;
        RETURN;
    END IF;
    
    -- Valid code
    RETURN QUERY SELECT true, promo_record.percentage, ''::TEXT;
END;
$function$;

-- Insert the September 2024 promotion for self-sponsored participants
INSERT INTO public.promo_codes (
    code,
    type,
    percentage,
    valid_from,
    valid_until,
    course_visibility_filter,
    sponsorship_type_filter,
    description,
    is_active
) VALUES (
    'SELF20SEPT',
    'seasonal',
    20,
    '2024-09-13',
    '2024-09-30',
    'both',
    'self',
    '20% discount for self-sponsored participants - September 2024 promotion',
    true
);