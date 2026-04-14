-- Enable RLS on course_runs table
ALTER TABLE public.course_runs ENABLE ROW LEVEL SECURITY;

-- Allow public to view public course runs
CREATE POLICY "Anyone can view course runs"
ON public.course_runs
FOR SELECT
USING (true);

-- Allow admins to insert course runs
CREATE POLICY "Admins can insert course runs"
ON public.course_runs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update course runs
CREATE POLICY "Admins can update course runs"
ON public.course_runs
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete course runs
CREATE POLICY "Admins can delete course runs"
ON public.course_runs
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on invoices table
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all invoices
CREATE POLICY "Admins can view all invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert invoices
CREATE POLICY "Admins can insert invoices"
ON public.invoices
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update invoices
CREATE POLICY "Admins can update invoices"
ON public.invoices
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete invoices
CREATE POLICY "Admins can delete invoices"
ON public.invoices
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on registrations table
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all registrations
CREATE POLICY "Admins can view all registrations"
ON public.registrations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow anyone to insert registrations (for public registration)
CREATE POLICY "Anyone can create registrations"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow admins to update registrations
CREATE POLICY "Admins can update registrations"
ON public.registrations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete registrations
CREATE POLICY "Admins can delete registrations"
ON public.registrations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on organizations table
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all organizations
CREATE POLICY "Admins can view all organizations"
ON public.organizations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow anyone to insert organizations (for public registration)
CREATE POLICY "Anyone can create organizations"
ON public.organizations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow admins to update organizations
CREATE POLICY "Admins can update organizations"
ON public.organizations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete organizations
CREATE POLICY "Admins can delete organizations"
ON public.organizations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));