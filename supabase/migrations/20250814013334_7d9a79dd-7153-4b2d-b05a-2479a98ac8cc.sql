-- Add course agenda field to courses table
ALTER TABLE public.courses 
ADD COLUMN course_agenda TEXT;

-- Add include_course_agenda field to email_templates table
ALTER TABLE public.email_templates 
ADD COLUMN include_course_agenda BOOLEAN NOT NULL DEFAULT false;