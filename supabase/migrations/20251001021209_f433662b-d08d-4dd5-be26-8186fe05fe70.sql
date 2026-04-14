-- Enable Row Level Security on trainees table
ALTER TABLE public.trainees ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all trainees
CREATE POLICY "Admins can view all trainees"
ON public.trainees
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert trainees
CREATE POLICY "Admins can insert trainees"
ON public.trainees
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update trainees
CREATE POLICY "Admins can update trainees"
ON public.trainees
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete trainees
CREATE POLICY "Admins can delete trainees"
ON public.trainees
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));