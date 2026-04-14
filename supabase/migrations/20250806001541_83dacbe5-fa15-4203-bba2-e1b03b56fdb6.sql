-- Add unique registration URL column to course_runs table
ALTER TABLE course_runs 
ADD COLUMN registration_url TEXT UNIQUE;

-- Create index for better performance on URL lookups
CREATE INDEX idx_course_runs_registration_url ON course_runs(registration_url);

-- Function to generate unique slug from course title and dates
CREATE OR REPLACE FUNCTION generate_course_run_slug(course_title TEXT, start_date DATE)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Update existing course runs with generated URLs
UPDATE course_runs 
SET registration_url = generate_course_run_slug(
    COALESCE(title, 'course-run'), 
    COALESCE(start_date, CURRENT_DATE)
)
WHERE registration_url IS NULL;