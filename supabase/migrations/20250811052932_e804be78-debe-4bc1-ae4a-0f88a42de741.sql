-- Add registration_url field to courses table
ALTER TABLE public.courses 
ADD COLUMN registration_url TEXT UNIQUE;

-- Create index for better performance on course URL lookups
CREATE INDEX idx_courses_registration_url ON public.courses(registration_url);

-- Update the generate_course_run_slug function to also handle course slugs
CREATE OR REPLACE FUNCTION public.generate_course_slug(course_title text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from course title
    base_slug := LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(course_title, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        )
    );
    
    final_slug := base_slug;
    
    -- Check if slug exists and add counter if needed
    WHILE EXISTS (SELECT 1 FROM courses WHERE registration_url = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$function$;