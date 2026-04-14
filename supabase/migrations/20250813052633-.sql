-- Create enum for partner tiers
CREATE TYPE public.partner_tier AS ENUM ('Tier 1', 'Tier 2', 'Tier 3');

-- Create partners table
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  partner_code TEXT NOT NULL UNIQUE,
  tier partner_tier NOT NULL DEFAULT 'Tier 3',
  address TEXT NOT NULL,
  contact_person_1 TEXT NOT NULL,
  contact_person_2 TEXT,
  email TEXT NOT NULL,
  contact_number_1 TEXT NOT NULL,
  contact_number_2 TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Create policy for partners
CREATE POLICY "Enable all operations for partners" 
ON public.partners 
FOR ALL 
USING (true);

-- Create function to generate partner code
CREATE OR REPLACE FUNCTION public.generate_partner_code(partner_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    base_code TEXT;
    final_code TEXT;
    counter INTEGER := 1;
BEGIN
    -- Create base code from partner name (first 3 characters + sequential number)
    base_code := UPPER(LEFT(REGEXP_REPLACE(partner_name, '[^a-zA-Z]', '', 'g'), 3));
    
    -- If less than 3 characters, pad with 'X'
    WHILE LENGTH(base_code) < 3 LOOP
        base_code := base_code || 'X';
    END LOOP;
    
    final_code := base_code || LPAD(counter::text, 3, '0');
    
    -- Check if code exists and increment counter if needed
    WHILE EXISTS (SELECT 1 FROM partners WHERE partner_code = final_code) LOOP
        counter := counter + 1;
        final_code := base_code || LPAD(counter::text, 3, '0');
    END LOOP;
    
    RETURN final_code;
END;
$function$;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_partners_updated_at
BEFORE UPDATE ON public.partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();