import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DateRange } from '@/components/admin/reports/ReportFilters';

export interface ReportData {
  summary: {
    totalRegistrations: number;
    totalParticipants: number;
    totalRevenue: number;
    activeCourses: number;
    registrationsTrend: number;
    participantsTrend: number;
    revenueTrend: number;
    coursesTrend: number;
  };
  registrationTrends: Array<{
    date: string;
    registrations: number;
    participants: number;
  }>;
  revenueData: Array<{
    period: string;
    revenue: number;
    paid: number;
    pending: number;
  }>;
  coursePopularity: Array<{
    course_name: string;
    registration_count: number;
    revenue: number;
  }>;
}

export const useReportsData = () => {
  const [data, setData] = useState<ReportData>({
    summary: {
      totalRegistrations: 0,
      totalParticipants: 0,
      totalRevenue: 0,
      activeCourses: 0,
      registrationsTrend: 0,
      participantsTrend: 0,
      revenueTrend: 0,
      coursesTrend: 0,
    },
    registrationTrends: [],
    revenueData: [],
    coursePopularity: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });
  const [reportType, setReportType] = useState('overview');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching reports data...');

      // Fetch registrations with related data
      const { data: registrations, error } = await supabase
        .from('registrations')
        .select(`
          *,
          course_runs!inner(
            *,
            courses!inner(*)
          ),
          trainees(id)
        `)
        .gte('created_at', `${dateRange.start_date}T00:00:00`)
        .lte('created_at', `${dateRange.end_date}T23:59:59`);

      if (error) throw error;

      // Process data for charts and summary
      const processedData = processReportsData(registrations || []);
      setData(processedData);

    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast({
        title: "Error loading reports",
        description: "Failed to fetch reports data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    dateRange,
    setDateRange,
    reportType,
    setReportType,
    refreshData: fetchData,
  };
};

function processReportsData(registrations: any[]): ReportData {
  // Calculate summary statistics
  const totalRegistrations = registrations.length;
  const totalParticipants = registrations.reduce((sum, reg) => sum + (reg.trainees?.length || 0), 0);
  const totalRevenue = registrations.reduce((sum, reg) => sum + (parseFloat(reg.payment_amount) || 0), 0);
  
  // Get unique courses
  const uniqueCourses = new Set(registrations.map(reg => reg.course_runs?.courses?.id)).size;

  // Process registration trends (group by week)
  const registrationTrends = processRegistrationTrends(registrations);
  
  // Process revenue data (group by month)
  const revenueData = processRevenueData(registrations);
  
  // Process course popularity
  const coursePopularity = processCoursePopularity(registrations);

  return {
    summary: {
      totalRegistrations,
      totalParticipants,
      totalRevenue,
      activeCourses: uniqueCourses,
      registrationsTrend: 5, // Mock trend data
      participantsTrend: 8,
      revenueTrend: 12,
      coursesTrend: 3,
    },
    registrationTrends,
    revenueData,
    coursePopularity,
  };
}

function processRegistrationTrends(registrations: any[]) {
  const trends: { [key: string]: { registrations: number; participants: number } } = {};
  
  registrations.forEach(reg => {
    const date = new Date(reg.created_at).toISOString().split('T')[0];
    if (!trends[date]) {
      trends[date] = { registrations: 0, participants: 0 };
    }
    trends[date].registrations += 1;
    trends[date].participants += reg.trainees?.length || 0;
  });

  return Object.entries(trends)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function processRevenueData(registrations: any[]) {
  const revenueByMonth: { [key: string]: { paid: number; pending: number } } = {};
  
  registrations.forEach(reg => {
    const month = new Date(reg.created_at).toISOString().substring(0, 7);
    if (!revenueByMonth[month]) {
      revenueByMonth[month] = { paid: 0, pending: 0 };
    }
    
    const amount = parseFloat(reg.payment_amount) || 0;
    if (reg.payment_status === 'paid') {
      revenueByMonth[month].paid += amount;
    } else {
      revenueByMonth[month].pending += amount;
    }
  });

  return Object.entries(revenueByMonth)
    .map(([period, data]) => ({ 
      period, 
      revenue: data.paid + data.pending,
      ...data 
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

function processCoursePopularity(registrations: any[]) {
  const popularity: { [key: string]: { count: number; revenue: number } } = {};
  
  registrations.forEach(reg => {
    const courseName = reg.course_runs?.courses?.title || 'Unknown Course';
    if (!popularity[courseName]) {
      popularity[courseName] = { count: 0, revenue: 0 };
    }
    
    popularity[courseName].count += 1;
    popularity[courseName].revenue += parseFloat(reg.payment_amount) || 0;
  });

  return Object.entries(popularity)
    .map(([course_name, data]) => ({
      course_name,
      registration_count: data.count,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.registration_count - a.registration_count)
    .slice(0, 10); // Top 10 courses
}