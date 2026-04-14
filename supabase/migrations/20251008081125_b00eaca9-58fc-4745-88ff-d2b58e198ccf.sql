-- Drop the existing "Anyone can view course runs" policy
DROP POLICY IF EXISTS "Anyone can view course runs" ON course_runs;

-- Create new policy: Public can only view public course runs
CREATE POLICY "Public can view public course runs"
ON course_runs
FOR SELECT
TO authenticated, anon
USING (visibility = 'public');

-- Update the admin policy to ensure admins can see all course runs
DROP POLICY IF EXISTS "Admins can view all course runs" ON course_runs;

CREATE POLICY "Admins can view all course runs"
ON course_runs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Update trainer policy to ensure they can see their assigned courses regardless of visibility
DROP POLICY IF EXISTS "Trainers can view their assigned course runs" ON course_runs;

CREATE POLICY "Trainers can view their assigned course runs"
ON course_runs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM trainers
    WHERE trainers.id = course_runs.trainer_id
    AND trainers.user_id = auth.uid()
  )
);