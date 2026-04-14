
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AttendanceRecord {
  id: string;
  trainee_id: string;
  registration_id: string;
  attendance_date: string;
  is_present: boolean;
  signature_data: string | null;
  created_at: string;
}

export const useAttendanceData = (registrationId: string, date?: string) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchAttendanceData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching attendance data...');
      
      let query = supabase
        .from('attendance')
        .select(`
          *,
          trainees (
            id,
            full_name,
            nric
          )
        `)
        .eq('registration_id', registrationId);
        
      if (date) {
        query = query.eq('attendance_date', date);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching attendance:', error);
        throw error;
      }
      
      console.log('Attendance data:', data);
      // Transform the data to match our interface
      const transformedData = data?.map(record => ({
        id: record.id,
        trainee_id: record.trainee_id,
        registration_id: record.registration_id,
        attendance_date: record.attendance_date,
        is_present: record.is_present,
        signature_data: record.signature_data,
        created_at: record.created_at
      })) || [];
      
      setAttendanceRecords(transformedData);
    } catch (error) {
      console.error('Error in attendance data fetching:', error);
      toast({
        title: "Error loading attendance records",
        description: "Failed to fetch attendance data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [registrationId, date]);
  
  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);
  
  const refreshAttendanceData = useCallback(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);
  
  return { attendanceRecords, loading, refreshAttendanceData };
};
