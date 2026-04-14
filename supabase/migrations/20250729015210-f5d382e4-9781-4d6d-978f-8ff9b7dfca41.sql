-- Clean up all data except admin authentication records
-- Delete in order to respect foreign key constraints

-- Delete attendance records first
DELETE FROM public.attendance;

-- Delete trainees
DELETE FROM public.trainees;

-- Delete invoices
DELETE FROM public.invoices;

-- Delete quotations
DELETE FROM public.quotations;

-- Delete registrations
DELETE FROM public.registrations;

-- Delete course runs
DELETE FROM public.course_runs;

-- Delete courses
DELETE FROM public.courses;

-- Delete organizations
DELETE FROM public.organizations;

-- Delete email templates
DELETE FROM public.email_templates;