-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a table to track sent reminders to avoid duplicates
CREATE TABLE public.email_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainee_id UUID NOT NULL,
  course_run_id UUID NOT NULL,
  reminder_type TEXT NOT NULL DEFAULT 'course_reminder',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_reminders ENABLE ROW LEVEL SECURITY;

-- Create policy for email reminders
CREATE POLICY "Enable all operations for email_reminders" 
ON public.email_reminders 
FOR ALL 
USING (true);

-- Add foreign key constraints
ALTER TABLE public.email_reminders 
ADD CONSTRAINT fk_email_reminders_trainee 
FOREIGN KEY (trainee_id) REFERENCES public.trainees(id) ON DELETE CASCADE;

ALTER TABLE public.email_reminders 
ADD CONSTRAINT fk_email_reminders_course_run 
FOREIGN KEY (course_run_id) REFERENCES public.course_runs(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_email_reminders_trainee_course_run ON public.email_reminders(trainee_id, course_run_id, reminder_type);