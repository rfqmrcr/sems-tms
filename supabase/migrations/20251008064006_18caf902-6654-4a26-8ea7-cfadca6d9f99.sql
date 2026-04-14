-- Add RLS policies for promo_codes table
-- Admins need full access to manage promo codes

CREATE POLICY "Admins can view all promo codes"
ON public.promo_codes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert promo codes"
ON public.promo_codes
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update promo codes"
ON public.promo_codes
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete promo codes"
ON public.promo_codes
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));