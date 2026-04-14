-- Add course content URL column to courses table
ALTER TABLE public.courses 
ADD COLUMN course_content_url TEXT;

-- Add include course content option to email templates
ALTER TABLE public.email_templates 
ADD COLUMN include_course_content BOOLEAN NOT NULL DEFAULT false;

-- Create storage bucket for course content
INSERT INTO storage.buckets (id, name, public) VALUES ('course-content', 'course-content', false);

-- Create policies for course content uploads
CREATE POLICY "Course content are accessible to authenticated users" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'course-content' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload course content" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'course-content' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update course content" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'course-content' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete course content" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'course-content' AND auth.role() = 'authenticated');