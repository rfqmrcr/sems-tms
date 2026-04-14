-- Create trainer_courses junction table for many-to-many relationship
CREATE TABLE public.trainer_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trainer_id, course_id)
);

-- Enable RLS
ALTER TABLE public.trainer_courses ENABLE ROW LEVEL SECURITY;

-- Create policy for trainer_courses
CREATE POLICY "Enable all operations for trainer_courses" 
ON public.trainer_courses 
FOR ALL 
USING (true);