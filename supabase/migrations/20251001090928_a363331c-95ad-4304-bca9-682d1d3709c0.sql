-- Fix RLS policies for public registration flow
-- Drop and recreate the organizations insert policy as PERMISSIVE
DROP POLICY IF EXISTS "Anyone can create organizations" ON organizations;
CREATE POLICY "Anyone can create organizations"
  ON organizations
  FOR INSERT
  WITH CHECK (true);

-- Drop and recreate trainees policies
DROP POLICY IF EXISTS "Admins can insert trainees" ON trainees;
DROP POLICY IF EXISTS "Anyone can create trainees during registration" ON trainees;

-- Allow admins to insert trainees
CREATE POLICY "Admins can insert trainees"
  ON trainees
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow public trainee creation during registration
CREATE POLICY "Anyone can create trainees during registration"
  ON trainees
  FOR INSERT
  WITH CHECK (true);