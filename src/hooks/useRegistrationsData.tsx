import { useState, useEffect } from 'react';
import { getTable, delay } from '@/data/mockDatabase';
import { toast } from '@/hooks/use-toast';

export interface Registration {
  id: string;
  custom_registration_id: string | null;
  created_at: string;
  contact_name: string;
  company_name: string;
  email: string;
  phone: string;
  participant_count: number;
  course_id: string;
  course_run_id?: string;
  course_name?: string;
  course_description?: string;
  course_start_date: string;
  course_end_date: string;
  course_location?: string | null;
  course_price?: number;
  payment_amount: number;
  payment_status: string;
  payment_type?: string | null;
  payment_terms?: string | null;
  hrdf_grant: boolean;
  cme_sales_representative?: string | null;
  qbo_invoice_number?: string | null;
}

export const useRegistrationsData = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      await delay(300);

      const allRegs = getTable('registrations');
      const allOrgs = getTable('organizations');
      const allTrainees = getTable('trainees');
      const allCourses = getTable('courses');
      const allCourseRuns = getTable('course_runs');

      const formattedRegistrations = allRegs.map((reg: any) => {
        const org = allOrgs.find((o: any) => o.id === reg.organization_id);
        const course = allCourses.find((c: any) => c.id === reg.course_id);
        const courseRun = allCourseRuns.find((cr: any) => cr.id === reg.course_run_id);
        const participantCount = allTrainees.filter((t: any) => t.registration_id === reg.id).length;

        return {
          id: reg.id,
          custom_registration_id: reg.custom_registration_id || null,
          created_at: reg.created_at || new Date().toISOString(),
          contact_name: reg.contact_person,
          company_name: org ? org.name : 'N/A',
          email: reg.contact_email,
          phone: reg.contact_number || 'N/A',
          participant_count: participantCount,
          course_id: reg.course_id,
          course_run_id: reg.course_run_id,
          course_name: course?.title || 'Unknown Course',
          course_description: course?.description || '',
          course_start_date: courseRun?.start_date || 'N/A',
          course_end_date: courseRun?.end_date || 'N/A',
          course_location: courseRun?.location || null,
          course_price: courseRun?.price || 0,
          payment_amount: reg.payment_amount || 0,
          payment_status: reg.payment_status || 'unpaid',
          payment_type: reg.payment_type || null,
          payment_terms: reg.payment_terms || null,
          hrdf_grant: reg.hrdf_grant || false,
          cme_sales_representative: reg.cme_sales_representative || null,
          qbo_invoice_number: reg.qbo_invoice_number || null
        };
      }).filter((r: any) => r.participant_count > 0);

      setRegistrations(formattedRegistrations);
    } catch (error) {
      toast({
        title: "Error loading registrations",
        description: "Failed to fetch registrations data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRegistrations();
  }, []);
  
  return { registrations, loading, refreshRegistrations: fetchRegistrations };
};
