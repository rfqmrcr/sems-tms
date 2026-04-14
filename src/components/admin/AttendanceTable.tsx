
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import SignaturePad from '@/components/admin/SignaturePad';
import AttendanceRow from './attendance/AttendanceRow';
import useAttendanceRecords from '@/hooks/useAttendanceRecords';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AttendanceTableProps {
  trainees: any[];
  registrationId: string;
  startDate: Date;
  endDate: Date;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ 
  trainees, 
  registrationId, 
  startDate,
  endDate
}) => {
  const [openSignaturePad, setOpenSignaturePad] = useState<{traineeId: string, date: string} | null>(null);
  const [activeDate, setActiveDate] = useState<string>('');
  
  const { 
    loading, 
    saving, 
    courseDates,
    formattedDates,
    fetchAttendance, 
    handlePresenceChange, 
    handleSaveSignature,
    getAttendanceStatus
  } = useAttendanceRecords(registrationId, startDate, endDate);

  // Set the first date as active by default
  useEffect(() => {
    if (formattedDates.length > 0 && !activeDate) {
      setActiveDate(formattedDates[0]);
    }
  }, [formattedDates, activeDate]);

  // Fetch attendance records on component mount
  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Handle saving signature and close signature pad
  const onSaveSignature = async (traineeId: string, signatureData: string) => {
    if (!openSignaturePad) return;
    
    const success = await handleSaveSignature(traineeId, openSignaturePad.date, signatureData);
    if (success) {
      setOpenSignaturePad(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Format date for display (e.g., "Monday, 29 May")
  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, d MMM');
  };

  return (
    <div>
      {courseDates.length > 1 ? (
        <Tabs 
          value={activeDate} 
          onValueChange={setActiveDate}
          className="mb-6"
        >
          <TabsList className="mb-4 flex flex-wrap">
            {formattedDates.map((dateString) => (
              <TabsTrigger key={dateString} value={dateString} className="flex-grow">
                {formatDateForDisplay(dateString)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {formattedDates.map((dateString) => (
            <TabsContent key={dateString} value={dateString}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>ID/NRIC</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Signature</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainees.map(trainee => {
                    const { isPresent, signatureData } = getAttendanceStatus(trainee.id, dateString);
                    
                    return (
                      <AttendanceRow
                        key={`${trainee.id}-${dateString}`}
                        trainee={trainee}
                        attendanceRecord={{
                          id: '', // Not used directly
                          trainee_id: trainee.id,
                          is_present: isPresent,
                          signature_data: signatureData
                        }}
                        saving={saving}
                        onTogglePresence={(checked) => handlePresenceChange(trainee.id, dateString, checked)}
                        onOpenSignaturePad={() => setOpenSignaturePad({traineeId: trainee.id, date: dateString})}
                        dayLabel={formatDateForDisplay(dateString)}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        // Single day view (original implementation)
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>ID/NRIC</TableHead>
              <TableHead>Present</TableHead>
              <TableHead>Signature</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainees.map(trainee => {
              const { isPresent, signatureData } = getAttendanceStatus(trainee.id, formattedDates[0] || '');
              
              return (
                <AttendanceRow
                  key={trainee.id}
                  trainee={trainee}
                  attendanceRecord={{
                    id: '', // Not used directly
                    trainee_id: trainee.id,
                    is_present: isPresent,
                    signature_data: signatureData
                  }}
                  saving={saving}
                  onTogglePresence={(checked) => handlePresenceChange(trainee.id, formattedDates[0] || '', checked)}
                  onOpenSignaturePad={() => setOpenSignaturePad({traineeId: trainee.id, date: formattedDates[0] || ''})}
                />
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Signature pad dialog */}
      {openSignaturePad && (
        <SignaturePad
          open={!!openSignaturePad}
          onClose={() => setOpenSignaturePad(null)}
          onSave={(data) => onSaveSignature(openSignaturePad.traineeId, data)}
          traineeId={openSignaturePad.traineeId}
          traineeName={trainees.find(t => t.id === openSignaturePad.traineeId)?.full_name || ''}
        />
      )}
    </div>
  );
};

export default AttendanceTable;
