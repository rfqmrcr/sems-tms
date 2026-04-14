
-- Enable RLS policies for quotations table
CREATE POLICY "Enable all operations for quotations" 
ON public.quotations 
FOR ALL 
USING (true);
