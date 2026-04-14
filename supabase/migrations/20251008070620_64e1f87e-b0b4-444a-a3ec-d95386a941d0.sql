-- Add RLS policies for email_templates table to allow admin access

-- Admins can view all email templates
CREATE POLICY "Admins can view all email templates"
ON email_templates
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert email templates
CREATE POLICY "Admins can insert email templates"
ON email_templates
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update email templates
CREATE POLICY "Admins can update email templates"
ON email_templates
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete email templates
CREATE POLICY "Admins can delete email templates"
ON email_templates
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));