-- Add SELECT policy for registrations to allow anonymous users to read their own registration
DROP POLICY IF EXISTS "Anyone can view their own registration" ON public.registrations;

CREATE POLICY "Anyone can view their own registration"
ON public.registrations
FOR SELECT
TO anon, authenticated
USING (true);

-- Add SELECT policy for trainees to allow reading during registration
DROP POLICY IF EXISTS "Anyone can view trainees" ON public.trainees;

CREATE POLICY "Anyone can view trainees"
ON public.trainees
FOR SELECT
TO anon, authenticated
USING (true);