-- Create course_run_schedules table for per-day timing
CREATE TABLE public.course_run_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_run_id UUID NOT NULL REFERENCES public.course_runs(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL,
  start_time TIME NOT NULL DEFAULT '09:00:00',
  end_time TIME NOT NULL DEFAULT '18:00:00',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(course_run_id, schedule_date)
);

-- Enable RLS
ALTER TABLE public.course_run_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all schedules"
  ON public.course_run_schedules
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert schedules"
  ON public.course_run_schedules
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update schedules"
  ON public.course_run_schedules
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete schedules"
  ON public.course_run_schedules
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view schedules for public courses"
  ON public.course_run_schedules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.course_runs
      WHERE course_runs.id = course_run_schedules.course_run_id
      AND course_runs.visibility = 'public'
    )
  );

CREATE POLICY "Trainers can view schedules for their courses"
  ON public.course_run_schedules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.course_runs
      JOIN public.trainers ON trainers.id = course_runs.trainer_id
      WHERE course_runs.id = course_run_schedules.course_run_id
      AND trainers.user_id = auth.uid()
    )
  );

-- Migrate existing course runs to create daily schedules
INSERT INTO public.course_run_schedules (course_run_id, schedule_date, start_time, end_time)
SELECT 
  cr.id,
  generate_series(cr.start_date, cr.end_date, '1 day'::interval)::date AS schedule_date,
  cr.start_time,
  cr.end_time
FROM public.course_runs cr
WHERE cr.start_date IS NOT NULL AND cr.end_date IS NOT NULL;

-- Create updated_at trigger
CREATE TRIGGER update_course_run_schedules_updated_at
  BEFORE UPDATE ON public.course_run_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_course_run_schedules_course_run_id ON public.course_run_schedules(course_run_id);
CREATE INDEX idx_course_run_schedules_date ON public.course_run_schedules(schedule_date);