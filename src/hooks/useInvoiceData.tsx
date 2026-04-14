
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Invoice, InvoiceStatus } from '@/types/invoice';

export const useInvoiceData = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      console.log('Fetching invoices data...');
      
      // Fetch invoices with join to registrations
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          registrations (
            id,
            contact_person,
            contact_email,
            contact_number,
            organization_id,
            payment_status,
            organization: organizations ( name ),
            course_run_id,
            course_runs (
              title,
              start_date,
              end_date,
              courses ( id, title )
            )
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }
      
      console.log('Invoices data:', data);
      
      // Properly cast the data to match our Invoice type
      const typedInvoices: Invoice[] = (data || []).map((invoice: any) => ({
        ...invoice,
        status: invoice.status as InvoiceStatus,
        registration: invoice.registrations
      }));
      
      setInvoices(typedInvoices);
    } catch (error) {
      console.error('Error in invoice data fetching:', error);
      toast({
        title: "Error loading invoices",
        description: "Failed to fetch invoices data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchInvoices();
  }, []);
  
  return { invoices, loading, refreshInvoices: fetchInvoices };
};
