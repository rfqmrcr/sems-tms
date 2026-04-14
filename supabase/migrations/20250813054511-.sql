-- Create discount types enum
CREATE TYPE public.discount_type AS ENUM ('seasonal', 'invitation', 'special');

-- Create promo codes table
CREATE TABLE public.promo_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    type discount_type NOT NULL,
    percentage NUMERIC(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL,
    usage_limit INTEGER DEFAULT NULL,
    usage_count INTEGER NOT NULL DEFAULT 0,
    course_visibility_filter TEXT CHECK (course_visibility_filter IN ('public', 'private', 'both')) DEFAULT 'both',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    description TEXT
);

-- Create partner discount configuration table
CREATE TABLE public.partner_discounts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tier partner_tier NOT NULL UNIQUE,
    public_course_discount NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (public_course_discount >= 0 AND public_course_discount <= 100),
    private_course_discount NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (private_course_discount >= 0 AND private_course_discount <= 100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default partner discount rates
INSERT INTO public.partner_discounts (tier, public_course_discount, private_course_discount) VALUES
('Tier 1', 15.00, 20.00),
('Tier 2', 10.00, 15.00),
('Tier 3', 5.00, 10.00);

-- Add promo code tracking to registrations
ALTER TABLE public.registrations 
ADD COLUMN promo_code_used TEXT,
ADD COLUMN partner_discount_percentage NUMERIC(5,2) DEFAULT 0,
ADD COLUMN promo_discount_percentage NUMERIC(5,2) DEFAULT 0,
ADD COLUMN total_discount_percentage NUMERIC(5,2) DEFAULT 0,
ADD COLUMN original_amount NUMERIC,
ADD COLUMN discount_amount NUMERIC DEFAULT 0;

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_discounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable all operations for promo_codes" 
ON public.promo_codes 
FOR ALL 
USING (true);

CREATE POLICY "Enable all operations for partner_discounts" 
ON public.partner_discounts 
FOR ALL 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_promo_codes_updated_at
    BEFORE UPDATE ON public.promo_codes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_discounts_updated_at
    BEFORE UPDATE ON public.partner_discounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to validate and apply promo code
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

-- Function to get partner discount
CREATE OR REPLACE FUNCTION public.get_partner_discount(
    partner_tier_input partner_tier,
    course_visibility TEXT DEFAULT 'public'
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
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