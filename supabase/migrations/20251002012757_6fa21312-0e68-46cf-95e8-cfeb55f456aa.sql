-- Fix RLS policies to allow anonymous users during registration flow

-- Drop and recreate the organizations INSERT policy
DROP POLICY IF EXISTS "Anyone can create organizations" ON public.organizations;

CREATE POLICY "Anyone can create organizations"
ON public.organizations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Drop and recreate the registrations INSERT policy
DROP POLICY IF EXISTS "Anyone can create registrations" ON public.registrations;

CREATE POLICY "Anyone can create registrations"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Drop and recreate the trainees INSERT policy
DROP POLICY IF EXISTS "Anyone can create trainees during registration" ON public.trainees;

CREATE POLICY "Anyone can create trainees during registration"
ON public.trainees
FOR INSERT
TO anon, authenticated
WITH CHECK (true);