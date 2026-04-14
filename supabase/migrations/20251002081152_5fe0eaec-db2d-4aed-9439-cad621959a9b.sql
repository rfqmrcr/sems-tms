-- Undo the security fix: Restore public read access to trainees table
CREATE POLICY "Anyone can view trainees"
ON public.trainees
FOR SELECT
USING (true);

-- Remove the email_logs policies that were added
DROP POLICY IF EXISTS "Admins can view all email logs" ON public.email_logs;
DROP POLICY IF EXISTS "Admins can insert email logs" ON public.email_logs;
DROP POLICY IF EXISTS "Admins can update email logs" ON public.email_logs;
DROP POLICY IF EXISTS "Admins can delete email logs" ON public.email_logs;