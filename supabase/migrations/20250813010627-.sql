-- Create trainers table
CREATE TABLE public.trainers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  expertise TEXT,
  bio TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;

-- Create policy for trainers
CREATE POLICY "Enable all operations for trainers" 
ON public.trainers 
FOR ALL 
USING (true);

-- Add trainer_id to course_runs table
ALTER TABLE public.course_runs 
ADD COLUMN trainer_id UUID REFERENCES public.trainers(id);

-- Create trigger for automatic timestamp updates on trainers
CREATE TRIGGER update_trainers_updated_at
BEFORE UPDATE ON public.trainers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();