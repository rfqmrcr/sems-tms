
import React from 'react';
import { format } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trainee } from '@/hooks/useTraineesData';
import { Badge } from '@/components/ui/badge';

interface TraineeViewDialogProps {
  trainee: Trainee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TraineeViewDialog: React.FC<TraineeViewDialogProps> = ({
  trainee,
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Trainee Details</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
            <p className="mt-1 text-sm">{trainee.full_name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">NRIC / ID</h3>
            <p className="mt-1 text-sm">{trainee.nric || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Gender</h3>
            <p className="mt-1 text-sm">{trainee.gender || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
            <p className="mt-1 text-sm">
              {trainee.dob ? format(new Date(trainee.dob), 'dd MMM yyyy') : 'N/A'}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="mt-1 text-sm">{trainee.email || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
            <p className="mt-1 text-sm">{trainee.contact_number || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Organization</h3>
            <p className="mt-1 text-sm">{trainee.registration?.organization?.name || 'N/A'}</p>
          </div>
          
          <div className="col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Course Information</h3>
            {trainee.registration?.course_runs?.courses ? (
              <div className="mt-1 p-3 bg-blue-50 rounded-md border border-blue-100">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge className="bg-blue-500">{trainee.registration.course_runs.courses.title}</Badge>
                  {trainee.registration.course_runs.start_date && trainee.registration.course_runs.end_date && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {format(new Date(trainee.registration.course_runs.start_date), 'dd MMM yyyy')} - {format(new Date(trainee.registration.course_runs.end_date), 'dd MMM yyyy')}
                    </Badge>
                  )}
                </div>
                {trainee.registration.course_runs.courses.description && (
                  <p className="text-sm text-gray-600 mt-1">{trainee.registration.course_runs.courses.description}</p>
                )}
              </div>
            ) : (
              <p className="mt-1 text-sm text-gray-500">No course information available</p>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Contact Person</h3>
            <p className="mt-1 text-sm">{trainee.registration?.contact_person || 'N/A'}</p>
          </div>
        </div>
        
        <DialogFooter className="mt-6">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TraineeViewDialog;
