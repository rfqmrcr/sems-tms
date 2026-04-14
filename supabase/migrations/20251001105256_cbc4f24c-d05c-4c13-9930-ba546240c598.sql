-- Remove JD14 Form, Grant ID, and Attendance Form fields from registrations table
ALTER TABLE registrations 
DROP COLUMN IF EXISTS jd14_form_file_url,
DROP COLUMN IF EXISTS attendance_file_url,
DROP COLUMN IF EXISTS grant_id;