-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  registration_type TEXT, -- 'corporate', 'individual', 'hrdf', etc.
  trigger_point TEXT NOT NULL DEFAULT 'registration', -- 'registration', 'payment_confirmation', etc.
  is_active BOOLEAN NOT NULL DEFAULT true,
  include_quotation BOOLEAN NOT NULL DEFAULT false,
  attachment_urls TEXT[], -- Array of attachment URLs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for email templates
CREATE POLICY "Enable all operations for email_templates" 
ON public.email_templates 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();