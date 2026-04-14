import { useState, useEffect, useCallback } from 'react';
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
  course_name?: string;
  payment_amount: number;
  payment_status: string;
}

export interface DashboardStats {
  totalRegistrations: number;
  totalParticipants: number;
  upcomingSessions: number;
  totalRevenue: number;
  totalPaymentDue: number;
}

export const useDashboardData = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 0,
    totalParticipants: 0,
    upcomingSessions: 0,
    totalRevenue: 0,
    totalPaymentDue: 0
  });
  const [loading, setLoading] = useState(true);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      await delay(300);
      
      const allRegs = getTable('registrations');
      const allOrgs = getTable('organizations');
      const allTrainees = getTable('trainees');
      const allCourses = getTable('courses');
      const allCourseRuns = getTable('course_runs');

      let totalRevenue = 0;
      let totalPaymentDue = 0;

      const formattedRegistrations = allRegs.map((reg: any) => {
        const amount = reg.payment_amount || 0;
        totalRevenue += amount;
        if (reg.payment_status?.toLowerCase() !== 'paid') {
          totalPaymentDue += amount;
        }

        const org = allOrgs.find((o: any) => o.id === reg.organization_id);
        const course = allCourses.find((c: any) => c.id === reg.course_id);
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
          course_name: course ? course.title : 'Unknown Course',
          payment_amount: amount,
          payment_status: reg.payment_status || 'unpaid'
        };
      });

      const today = new Date().toISOString().split('T')[0];
      const upcomingSessions = allCourseRuns.filter((cr: any) => cr.visibility === 'public' && cr.start_date >= today).length;

      setRegistrations(formattedRegistrations);
      setStats({
        totalRegistrations: allRegs.length,
        totalParticipants: allTrainees.length,
        upcomingSessions,
        totalRevenue,
        totalPaymentDue
      });
    } catch (error) {
      toast({
        title: "Error loading dashboard",
        description: "Failed to fetch dashboard data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { registrations, stats, loading, refreshRegistrations: fetchData };
};
