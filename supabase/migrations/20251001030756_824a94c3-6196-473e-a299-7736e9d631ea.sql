-- Enable RLS on courses table
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Allow public to view all courses
CREATE POLICY "Anyone can view courses"
ON public.courses
FOR SELECT
USING (true);

-- Allow admins to insert courses
CREATE POLICY "Admins can insert courses"
ON public.courses
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update courses
CREATE POLICY "Admins can update courses"
ON public.courses
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete courses
CREATE POLICY "Admins can delete courses"
ON public.courses
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));