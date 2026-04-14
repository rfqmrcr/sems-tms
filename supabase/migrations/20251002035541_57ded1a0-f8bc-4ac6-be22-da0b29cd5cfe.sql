-- Add RLS policies for partners table
CREATE POLICY "Admins can view all partners"
ON public.partners
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert partners"
ON public.partners
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update partners"
ON public.partners
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete partners"
ON public.partners
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));