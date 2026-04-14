-- Create storage bucket for trainer resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('trainer-resumes', 'trainer-resumes', false);

-- Create storage policies for trainer resumes
CREATE POLICY "Authenticated users can view trainer resumes" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'trainer-resumes' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload trainer resumes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'trainer-resumes' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update trainer resumes" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'trainer-resumes' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete trainer resumes" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'trainer-resumes' AND auth.role() = 'authenticated');

-- Add resume_url column to trainers table
ALTER TABLE public.trainers ADD COLUMN resume_url text;

-- Add include_trainer_profile column to email_templates table
ALTER TABLE public.email_templates ADD COLUMN include_trainer_profile boolean NOT NULL DEFAULT false;