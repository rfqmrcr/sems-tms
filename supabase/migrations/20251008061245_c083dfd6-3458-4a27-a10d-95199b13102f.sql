-- Add custom_registration_id column to registrations table
ALTER TABLE public.registrations 
ADD COLUMN custom_registration_id TEXT UNIQUE;

-- Create function to generate custom registration ID
CREATE OR REPLACE FUNCTION public.generate_custom_registration_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create trigger to auto-generate custom_registration_id on insert
CREATE OR REPLACE FUNCTION public.set_custom_registration_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.custom_registration_id IS NULL THEN
        NEW.custom_registration_id := generate_custom_registration_id();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_custom_registration_id
BEFORE INSERT ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.set_custom_registration_id();