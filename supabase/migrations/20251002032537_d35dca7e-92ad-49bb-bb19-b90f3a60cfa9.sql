-- Create storage bucket for trainer resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('trainer-resumes', 'trainer-resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies for trainers table
CREATE POLICY "Admins can insert trainers"
ON public.trainers
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update trainers"
ON public.trainers
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete trainers"
ON public.trainers
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view trainers"
ON public.trainers
FOR SELECT
TO anon, authenticated
USING (true);

-- Add storage policies for trainer resumes bucket
CREATE POLICY "Admins can upload trainer resumes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'trainer-resumes' AND
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update trainer resumes"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'trainer-resumes' AND
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete trainer resumes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'trainer-resumes' AND
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Authenticated users can view trainer resumes"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'trainer-resumes');