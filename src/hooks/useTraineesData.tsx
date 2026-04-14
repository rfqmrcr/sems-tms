
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Trainee {
  id: string;
  full_name: string;
  nric?: string;
  dob?: string;
  gender?: string;
  contact_number?: string;
  email?: string;
  registration_id?: string;
  created_at: string;
  registration?: {
    contact_person: string;
    custom_registration_id?: string;
    organization?: {
      name: string;
    };
    course_runs?: {
      start_date?: string;
      end_date?: string;
      courses?: {
        title: string;
        description?: string;
      };
    };
  };
}

export const useTraineesData = () => {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchTrainees = async () => {
    try {
      setLoading(true);
      console.log('Fetching trainees data...');
      
      const { data: traineesData, error: traineesError } = await supabase
        .from('trainees')
        .select(`
          *,
          registration:registrations (
            contact_person,
            custom_registration_id,
            organization:organizations (
              name
            ),
            course_runs (
              start_date,
              end_date,
              courses (
                title,
                description
              )
            )
          )
        `)
        .order('created_at', { ascending: false });
        
      if (traineesError) {
        console.error('Error fetching trainees:', traineesError);
        throw traineesError;
      }
      
      console.log('Trainees data:', traineesData);
      setTrainees(traineesData || []);
    } catch (error) {
      console.error('Error in trainees data fetching:', error);
      toast({
        title: "Error loading trainees",
        description: "Failed to fetch trainees data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTrainees();
  }, []);
  
  return { trainees, loading, refreshTrainees: fetchTrainees };
};
