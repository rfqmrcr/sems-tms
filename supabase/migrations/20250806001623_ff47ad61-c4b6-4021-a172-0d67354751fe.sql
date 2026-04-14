-- Fix security warning by setting search_path for the function
DROP FUNCTION IF EXISTS generate_course_run_slug(TEXT, DATE);

CREATE OR REPLACE FUNCTION generate_course_run_slug(course_title TEXT, start_date DATE)
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from course title and start date
    base_slug := LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(course_title || '-' || TO_CHAR(start_date, 'YYYY-MM-DD'), '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        )
    );
    
    final_slug := base_slug;
    
    -- Check if slug exists and add counter if needed
    WHILE EXISTS (SELECT 1 FROM course_runs WHERE registration_url = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$;