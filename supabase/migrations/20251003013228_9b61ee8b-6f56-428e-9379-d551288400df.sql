-- Fix security: Remove public read access to trainees table while keeping public insert for registrations
DROP POLICY IF EXISTS "Anyone can view trainees" ON public.trainees;

-- The "Anyone can create trainees during registration" policy already exists and allows public INSERT
-- This ensures registrations work while protecting PII from public read access