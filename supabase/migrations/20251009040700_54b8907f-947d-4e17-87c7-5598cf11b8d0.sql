-- Update all Riyadh locations to Dubai Investment Park 1
UPDATE course_runs 
SET location = 'Dubai Investment Park 1' 
WHERE location = 'Riyadh';

-- Update any blank/null locations to Dubai Investment Park 1 as well
UPDATE course_runs 
SET location = 'Dubai Investment Park 1' 
WHERE location IS NULL OR location = '';