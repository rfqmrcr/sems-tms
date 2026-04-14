-- Add CC field to email_templates table
ALTER TABLE public.email_templates 
ADD COLUMN cc_emails text[];