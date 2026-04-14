-- Add new fields to registrations table for Grant ID and file uploads
ALTER TABLE public.registrations 
ADD COLUMN grant_id text,
ADD COLUMN attendance_file_url text,
ADD COLUMN jd14_form_file_url text;

-- Create storage bucket for registration documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('registration-documents', 'registration-documents', false);

-- Create RLS policies for registration documents bucket
CREATE POLICY "Users can upload registration documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'registration-documents');

CREATE POLICY "Users can view registration documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'registration-documents');

CREATE POLICY "Users can update registration documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'registration-documents');

CREATE POLICY "Users can delete registration documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'registration-documents');

-- Update email_templates table to support training completion trigger
ALTER TABLE public.email_templates 
ALTER COLUMN trigger_point TYPE text;

-- Add comment to clarify trigger_point options
COMMENT ON COLUMN public.email_templates.trigger_point IS 'Trigger options: registration, training_completion';

-- Update the update_updated_at trigger for registrations
DROP TRIGGER IF EXISTS update_registrations_updated_at ON public.registrations;
CREATE TRIGGER update_registrations_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();