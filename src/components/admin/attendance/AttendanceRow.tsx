
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import AttendanceStatusCell from './AttendanceStatusCell';
import AttendanceSignatureCell from './AttendanceSignatureCell';

interface Trainee {
  id: string;
  full_name: string;
  nric?: string;
}

interface AttendanceRecord {
  id: string;
  trainee_id: string;
  is_present: boolean;
  signature_data: string | null;
}

interface AttendanceRowProps {
  trainee: Trainee;
  attendanceRecord: AttendanceRecord | undefined;
  saving: boolean;
  onTogglePresence: (isPresent: boolean) => void;
  onOpenSignaturePad: () => void;
  dayLabel?: string; // Add optional day label
}

const AttendanceRow: React.FC<AttendanceRowProps> = ({
  trainee,
  attendanceRecord,
  saving,
  onTogglePresence,
  onOpenSignaturePad,
  dayLabel,
}) => {
  const isPresent = attendanceRecord?.is_present || false;
  const signatureData = attendanceRecord?.signature_data;
  
  return (
    <TableRow>
      <TableCell className="font-medium">{trainee.full_name}</TableCell>
      <TableCell>{trainee.nric || 'N/A'}</TableCell>
      <TableCell>
        <AttendanceStatusCell
          isPresent={isPresent}
          saving={saving}
          onTogglePresence={onTogglePresence}
          dayLabel={dayLabel}
        />
      </TableCell>
      <TableCell>
        <AttendanceSignatureCell
          signatureData={signatureData}
          traineeId={trainee.id}
          onOpenSignaturePad={onOpenSignaturePad}
        />
      </TableCell>
    </TableRow>
  );
};

export default AttendanceRow;
