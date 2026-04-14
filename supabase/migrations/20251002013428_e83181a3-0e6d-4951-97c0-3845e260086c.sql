-- Allow public (anon and authenticated) to SELECT organizations rows to support registration flow
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'organizations' AND policyname = 'Anyone can view organizations'
  ) THEN
    CREATE POLICY "Anyone can view organizations"
    ON public.organizations
    FOR SELECT
    TO anon, authenticated
    USING (true);
  END IF;
END $$;