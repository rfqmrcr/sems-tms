import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Quotation, QuotationStatus } from '@/types/quotation';

export const useQuotationData = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      console.log('Fetching quotations data...');
      
      // Fetch quotations with join to registrations
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          registrations (
            id,
            contact_person,
            contact_email,
            contact_number,
            organization_id,
            payment_status
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching quotations:', error);
        throw error;
      }
      
      console.log('Quotations data:', data);
      
      // Properly cast the data to match our Quotation type
      const typedQuotations: Quotation[] = (data || []).map((quotation: any) => ({
        ...quotation,
        status: quotation.status as QuotationStatus,
        registration: quotation.registrations
      }));
      
      setQuotations(typedQuotations);
    } catch (error) {
      console.error('Error in quotation data fetching:', error);
      toast({
        title: "Error loading quotations",
        description: "Failed to fetch quotations data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchQuotations();
  }, []);
  
  return { quotations, loading, refreshQuotations: fetchQuotations };
};