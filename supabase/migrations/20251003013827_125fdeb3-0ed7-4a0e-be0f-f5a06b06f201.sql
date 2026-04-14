-- Restore public read access to trainees table
CREATE POLICY "Anyone can view trainees"
ON public.trainees
FOR SELECT
USING (true);