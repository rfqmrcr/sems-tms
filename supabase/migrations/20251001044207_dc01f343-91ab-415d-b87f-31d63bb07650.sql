-- Add RLS policies for quotations table
CREATE POLICY "Admins can view all quotations"
ON public.quotations
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert quotations"
ON public.quotations
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update quotations"
ON public.quotations
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete quotations"
ON public.quotations
FOR DELETE
USING (has_role(auth.uid(), 'admin'));