-- Create junction table for course runs and trainers (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.course_run_trainers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_run_id UUID NOT NULL REFERENCES public.course_runs(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(course_run_id, trainer_id)
);

-- Enable RLS
ALTER TABLE public.course_run_trainers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can view all course run trainers"
ON public.course_run_trainers
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert course run trainers"
ON public.course_run_trainers
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete course run trainers"
ON public.course_run_trainers
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Trainers can view their assigned course runs"
ON public.course_run_trainers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM trainers
    WHERE trainers.id = course_run_trainers.trainer_id
    AND trainers.user_id = auth.uid()
  )
);

CREATE POLICY "Public can view course run trainers for public courses"
ON public.course_run_trainers
FOR SELECT
TO authenticated, anon
USING (
  EXISTS (
    SELECT 1
    FROM course_runs
    WHERE course_runs.id = course_run_trainers.course_run_id
    AND course_runs.visibility = 'public'
  )
);

-- Create index for better query performance
CREATE INDEX idx_course_run_trainers_course_run_id ON public.course_run_trainers(course_run_id);
CREATE INDEX idx_course_run_trainers_trainer_id ON public.course_run_trainers(trainer_id);

-- Migrate existing trainer_id data from course_runs to course_run_trainers
INSERT INTO public.course_run_trainers (course_run_id, trainer_id)
SELECT id, trainer_id
FROM public.course_runs
WHERE trainer_id IS NOT NULL
ON CONFLICT (course_run_id, trainer_id) DO NOTHING;