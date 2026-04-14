-- Create email_logs table to track all sent emails
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_type TEXT NOT NULL, -- 'registration', 'reminder', 'trainee_confirmation', 'contact'
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'failed', 'pending'
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Foreign keys for context
  registration_id UUID REFERENCES public.registrations(id),
  course_run_id UUID REFERENCES public.course_runs(id),
  trainee_id UUID REFERENCES public.trainees(id),
  
  -- Email metadata
  template_used TEXT,
  attachments JSONB,
  metadata JSONB -- Additional context like course details, etc.
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Enable all operations for email_logs" 
ON public.email_logs 
FOR ALL 
USING (true);

-- Create index for performance
CREATE INDEX idx_email_logs_sent_at ON public.email_logs(sent_at DESC);
CREATE INDEX idx_email_logs_email_type ON public.email_logs(email_type);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);