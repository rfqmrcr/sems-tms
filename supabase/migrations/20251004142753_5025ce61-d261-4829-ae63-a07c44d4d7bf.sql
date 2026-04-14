-- Extend app_role enum to include trainer
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'trainer';

-- Add user_id to trainers table to link with auth users
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create unique constraint to ensure one trainer per user
CREATE UNIQUE INDEX IF NOT EXISTS trainers_user_id_key ON public.trainers(user_id) WHERE user_id IS NOT NULL;

-- RLS policies for trainers to view their own assigned courses
CREATE POLICY "Trainers can view their assigned course runs"
ON public.course_runs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.trainers
    WHERE trainers.id = course_runs.trainer_id
    AND trainers.user_id = auth.uid()
  )
);

-- RLS policies for trainers to view registrations for their courses
CREATE POLICY "Trainers can view registrations for their courses"
ON public.registrations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.course_runs
    JOIN public.trainers ON trainers.id = course_runs.trainer_id
    WHERE course_runs.id = registrations.course_run_id
    AND trainers.user_id = auth.uid()
  )
);

-- RLS policies for trainers to view trainees in their courses
CREATE POLICY "Trainers can view trainees in their courses"
ON public.trainees
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.registrations
    JOIN public.course_runs ON course_runs.id = registrations.course_run_id
    JOIN public.trainers ON trainers.id = course_runs.trainer_id
    WHERE registrations.id = trainees.registration_id
    AND trainers.user_id = auth.uid()
  )
);

-- RLS policies for trainers to manage attendance
CREATE POLICY "Trainers can view attendance for their courses"
ON public.attendance
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.registrations
    JOIN public.course_runs ON course_runs.id = registrations.course_run_id
    JOIN public.trainers ON trainers.id = course_runs.trainer_id
    WHERE registrations.id = attendance.registration_id
    AND trainers.user_id = auth.uid()
  )
);

CREATE POLICY "Trainers can insert attendance for their courses"
ON public.attendance
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.registrations
    JOIN public.course_runs ON course_runs.id = registrations.course_run_id
    JOIN public.trainers ON trainers.id = course_runs.trainer_id
    WHERE registrations.id = attendance.registration_id
    AND trainers.user_id = auth.uid()
  )
);

CREATE POLICY "Trainers can update attendance for their courses"
ON public.attendance
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.registrations
    JOIN public.course_runs ON course_runs.id = registrations.course_run_id
    JOIN public.trainers ON trainers.id = course_runs.trainer_id
    WHERE registrations.id = attendance.registration_id
    AND trainers.user_id = auth.uid()
  )
);

-- Policy for trainers to view their own profile
CREATE POLICY "Trainers can view their own profile"
ON public.trainers
FOR SELECT
USING (user_id = auth.uid());