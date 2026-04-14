-- Fix search_path for the custom registration ID functions
-- First drop trigger, then functions, then recreate with proper search_path
DROP TRIGGER IF EXISTS trigger_set_custom_registration_id ON public.registrations;
DROP FUNCTION IF EXISTS public.set_custom_registration_id();
DROP FUNCTION IF EXISTS public.generate_custom_registration_id();

-- Recreate with proper search_path
CREATE OR REPLACE FUNCTION public.generate_custom_registration_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    date_prefix TEXT;
    next_number INTEGER;
    custom_id TEXT;
BEGIN
    -- Get today's date in YYYYMMDD format
    date_prefix := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    
    -- Find the highest number for today
    SELECT COALESCE(MAX(
        CASE 
            WHEN custom_registration_id LIKE date_prefix || '%' 
            THEN CAST(SUBSTRING(custom_registration_id FROM 9) AS INTEGER)
            ELSE 0
        END
    ), 0) + 1
    INTO next_number
    FROM public.registrations;
    
    -- Generate the custom ID with zero-padded number
    custom_id := date_prefix || LPAD(next_number::TEXT, 3, '0');
    
    RETURN custom_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_custom_registration_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    IF NEW.custom_registration_id IS NULL THEN
        NEW.custom_registration_id := generate_custom_registration_id();
    END IF;
    RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER trigger_set_custom_registration_id
BEFORE INSERT ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.set_custom_registration_id();