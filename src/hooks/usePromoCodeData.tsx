import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PromoCode {
  id: string;
  code: string;
  type: 'fixed_amount' | 'percentage';
  percentage: number;
  valid_from: string;
  valid_until: string;
  usage_limit: number | null;
  usage_count: number;
  course_visibility_filter: 'public' | 'private' | 'both';
  sponsorship_type_filter: 'self' | 'corporate' | 'both';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  description: string | null;
}

export const usePromoCodeData = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      console.log('Fetching promo codes data...');
      
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching promo codes:', error);
        throw error;
      }
      
      console.log('Promo codes data:', data);
      setPromoCodes((data || []) as PromoCode[]);
    } catch (error) {
      console.error('Error in promo codes data fetching:', error);
      toast({
        title: "Error loading promo codes",
        description: "Failed to fetch promo codes data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPromoCodes();
  }, []);
  
  return { promoCodes, loading, refreshPromoCodes: fetchPromoCodes };
};