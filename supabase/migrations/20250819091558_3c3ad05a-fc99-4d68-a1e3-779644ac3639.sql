-- Add updated_at column to registrations table
ALTER TABLE public.registrations 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now());

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON public.registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();