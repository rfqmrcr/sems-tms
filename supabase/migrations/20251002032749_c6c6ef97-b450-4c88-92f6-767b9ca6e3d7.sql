-- Add RLS policies for trainer_courses table (junction table for trainers and courses)
CREATE POLICY "Admins can insert trainer courses"
ON public.trainer_courses
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete trainer courses"
ON public.trainer_courses
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view trainer courses"
ON public.trainer_courses
FOR SELECT
TO anon, authenticated
USING (true);