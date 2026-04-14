-- Enable RLS on email_logs if not already enabled
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all email logs
CREATE POLICY "Admins can view all email logs"
ON email_logs
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to insert email logs (if needed from frontend)
CREATE POLICY "Admins can insert email logs"
ON email_logs
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow the service role (edge functions) to insert email logs
CREATE POLICY "Service role can insert email logs"
ON email_logs
FOR INSERT
TO service_role
WITH CHECK (true);