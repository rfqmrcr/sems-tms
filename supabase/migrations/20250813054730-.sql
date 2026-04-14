-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.validate_promo_code(
    code_input TEXT,
    course_visibility TEXT DEFAULT 'public'
)
RETURNS TABLE (
    is_valid BOOLEAN,
    discount_percentage NUMERIC,
    error_message TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    AND (course_visibility_filter = 'both' OR course_visibility_filter = course_visibility);
    
    -- Check if code exists and is valid
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0::NUMERIC, 'Invalid or expired promo code'::TEXT;
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
$$;

-- Fix search_path for partner discount function
CREATE OR REPLACE FUNCTION public.get_partner_discount(
    partner_tier_input partner_tier,
    course_visibility TEXT DEFAULT 'public'
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    discount_percentage NUMERIC := 0;
BEGIN
    SELECT 
        CASE 
            WHEN course_visibility = 'private' THEN private_course_discount
            ELSE public_course_discount
        END
    INTO discount_percentage
    FROM public.partner_discounts
    WHERE tier = partner_tier_input;
    
    RETURN COALESCE(discount_percentage, 0);
END;
$$;