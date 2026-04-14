-- Add medical_doctor column to trainees table
ALTER TABLE public.trainees 
ADD COLUMN medical_doctor boolean NOT NULL DEFAULT false;