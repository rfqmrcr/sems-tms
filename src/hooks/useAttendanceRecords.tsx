
import { useState, useCallback, useMemo } from 'react';
import { format, eachDayOfInterval } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AttendanceRecord {
  id: string;
  trainee_id: string;
  is_present: boolean;
  signature_data: string | null;
  attendance_date: string;
}

export const useAttendanceRecords = (registrationId: string, startDate: Date, endDate: Date) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord[]>>({});

  // Generate an array of dates between start and end date (inclusive)
  const courseDates = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  // Format dates for database queries
  const formattedDates = useMemo(() => {
    return courseDates.map(date => format(date, 'yyyy-MM-dd'));
  }, [courseDates]);

  // Fetch attendance records for all dates in the course
  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('registration_id', registrationId)
        .in('attendance_date', formattedDates);
        
      if (error) throw error;
      
      // Organize records by trainee_id, with each trainee having an array of records for different dates
      const recordsMap: Record<string, AttendanceRecord[]> = {};
      
      data?.forEach(record => {
        if (!recordsMap[record.trainee_id]) {
          recordsMap[record.trainee_id] = [];
        }
        recordsMap[record.trainee_id].push({
          id: record.id,
          trainee_id: record.trainee_id,
          is_present: record.is_present,
          signature_data: record.signature_data,
          attendance_date: record.attendance_date
        });
      });
      
      setAttendanceRecords(recordsMap);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  }, [registrationId, formattedDates]);

  // Handle presence toggle for a specific date
  const handlePresenceChange = async (traineeId: string, attendanceDate: string, isPresent: boolean) => {
    try {
      setSaving(true);
      
      // Find existing record for this trainee on this specific date
      const existingRecords = attendanceRecords[traineeId] || [];
      const existingRecord = existingRecords.find(record => record.attendance_date === attendanceDate);
      
      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('attendance')
          .update({ 
            is_present: isPresent
          })
          .eq('id', existingRecord.id);
          
        if (error) throw error;
        
        // Update local state
        setAttendanceRecords(prev => {
          const updatedRecords = [...(prev[traineeId] || [])];
          const recordIndex = updatedRecords.findIndex(r => r.attendance_date === attendanceDate);
          
          if (recordIndex >= 0) {
            updatedRecords[recordIndex] = { ...updatedRecords[recordIndex], is_present: isPresent };
          }
          
          return {
            ...prev,
            [traineeId]: updatedRecords
          };
        });
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('attendance')
          .insert({
            trainee_id: traineeId,
            registration_id: registrationId,
            attendance_date: attendanceDate,
            is_present: isPresent
          })
          .select('*')
          .single();
          
        if (error) throw error;
        
        // Update local state with new record
        setAttendanceRecords(prev => {
          const updatedRecords = [...(prev[traineeId] || [])];
          updatedRecords.push({
            id: data.id,
            trainee_id: data.trainee_id,
            is_present: data.is_present,
            signature_data: data.signature_data,
            attendance_date: data.attendance_date
          });
          
          return {
            ...prev,
            [traineeId]: updatedRecords
          };
        });
      }
      
      toast.success(`Attendance ${isPresent ? 'marked' : 'unmarked'} successfully`);
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Failed to update attendance');
    } finally {
      setSaving(false);
    }
  };

  // Handle saving signature for a specific date
  const handleSaveSignature = async (traineeId: string, attendanceDate: string, signatureData: string) => {
    try {
      setSaving(true);
      console.log('Saving signature for trainee:', traineeId);
      console.log('Registration ID:', registrationId);
      console.log('Attendance date:', attendanceDate);
      
      // Find existing record for this trainee on this specific date
      const existingRecords = attendanceRecords[traineeId] || [];
      const existingRecord = existingRecords.find(record => record.attendance_date === attendanceDate);
      
      if (existingRecord) {
        console.log('Updating existing attendance record:', existingRecord.id);
        // Update existing record
        const { data, error } = await supabase
          .from('attendance')
          .update({ 
            signature_data: signatureData,
            is_present: true // Auto-mark as present when signature is added
          })
          .eq('id', existingRecord.id)
          .select('*')
          .single();
          
        if (error) {
          console.error('Error updating signature:', error);
          throw new Error(`Failed to update signature: ${error.message}`);
        }
        
        console.log('Update successful, received data:', data);
        
        // Update local state
        setAttendanceRecords(prev => {
          const updatedRecords = [...(prev[traineeId] || [])];
          const recordIndex = updatedRecords.findIndex(r => r.attendance_date === attendanceDate);
          
          if (recordIndex >= 0) {
            updatedRecords[recordIndex] = { 
              ...updatedRecords[recordIndex], 
              signature_data: signatureData,
              is_present: true
            };
          }
          
          return {
            ...prev,
            [traineeId]: updatedRecords
          };
        });
      } else {
        console.log('Creating new attendance record for trainee');
        // Create new record with signature
        const { data, error } = await supabase
          .from('attendance')
          .insert({
            trainee_id: traineeId,
            registration_id: registrationId,
            attendance_date: attendanceDate,
            is_present: true,
            signature_data: signatureData
          })
          .select('*')
          .single();
          
        if (error) {
          console.error('Error creating attendance record with signature:', error);
          throw new Error(`Failed to create attendance record: ${error.message}`);
        }
        
        console.log('Insert successful, received data:', data);
        
        // Update local state with new record
        setAttendanceRecords(prev => {
          const updatedRecords = [...(prev[traineeId] || [])];
          updatedRecords.push({
            id: data.id,
            trainee_id: data.trainee_id,
            is_present: data.is_present,
            signature_data: data.signature_data,
            attendance_date: data.attendance_date
          });
          
          return {
            ...prev,
            [traineeId]: updatedRecords
          };
        });
      }
      
      toast.success('Signature saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving signature:', error);
      toast.error(`Failed to save signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Get attendance status for a specific trainee and date
  const getAttendanceStatus = useCallback((traineeId: string, attendanceDate: string) => {
    const traineeRecords = attendanceRecords[traineeId] || [];
    const record = traineeRecords.find(record => record.attendance_date === attendanceDate);
    
    return {
      isPresent: record?.is_present || false,
      signatureData: record?.signature_data || null,
      recordExists: !!record
    };
  }, [attendanceRecords]);

  return {
    loading,
    saving,
    attendanceRecords,
    courseDates,
    formattedDates,
    fetchAttendance,
    handlePresenceChange,
    handleSaveSignature,
    getAttendanceStatus
  };
};

export default useAttendanceRecords;
