-- Update all London locations to Dubai Investment Park 1
UPDATE course_runs 
SET location = 'Dubai Investment Park 1' 
WHERE location = 'London';