
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TraineeDeleteDialogProps {
  traineeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

const TraineeDeleteDialog: React.FC<TraineeDeleteDialogProps> = ({
  traineeId,
  open,
  onOpenChange,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // First, get the trainee's registration info to recalculate payment
      const { data: traineeData, error: fetchError } = await supabase
        .from('trainees')
        .select(`
          id,
          registration_id,
          registrations!trainees_registration_id_fkey (
            id,
            course_run_id,
            course_runs (
              price
            )
          )
        `)
        .eq('id', traineeId)
        .single();

      if (fetchError) {
        console.error('Error fetching trainee data:', fetchError);
        throw fetchError;
      }

      const registrationId = traineeData.registration_id;
      const coursePrice = traineeData.registrations?.course_runs?.price || 0;

      // Delete the trainee
      const { error: deleteError } = await supabase
        .from('trainees')
        .delete()
        .eq('id', traineeId);

      if (deleteError) {
        console.error('Error deleting trainee:', deleteError);
        throw deleteError;
      }

      // Count remaining trainees for this registration
      const { count: remainingCount, error: countError } = await supabase
        .from('trainees')
        .select('*', { count: 'exact', head: true })
        .eq('registration_id', registrationId);

      if (countError) {
        console.error('Error counting remaining trainees:', countError);
        throw countError;
      }

      // If no trainees remain, delete the entire registration
      if (remainingCount === 0) {
        // First delete related attendance records
        const { error: deleteAttendanceError } = await supabase
          .from('attendance')
          .delete()
          .eq('registration_id', registrationId);

        if (deleteAttendanceError) {
          console.error('Error deleting attendance records:', deleteAttendanceError);
          // Continue anyway as attendance might not exist
        }

        // Delete the registration
        const { error: deleteRegError } = await supabase
          .from('registrations')
          .delete()
          .eq('id', registrationId);

        if (deleteRegError) {
          console.error('Error deleting registration:', deleteRegError);
          throw deleteRegError;
        }

        console.log(`Deleted registration ${registrationId} as no trainees remain`);

        toast({
          title: "Success",
          description: "Trainee deleted successfully. Registration removed as no trainees remain.",
        });
      } else {
        // Update the registration's payment amount based on remaining trainees
        const newPaymentAmount = remainingCount * coursePrice;
        
        const { error: updateError } = await supabase
          .from('registrations')
          .update({ payment_amount: newPaymentAmount })
          .eq('id', registrationId);

        if (updateError) {
          console.error('Error updating registration payment amount:', updateError);
          throw updateError;
        }

        console.log(`Updated registration ${registrationId} payment amount to ${newPaymentAmount} for ${remainingCount} trainees`);

        toast({
          title: "Success",
          description: "Trainee deleted successfully and payment amount updated.",
        });
      }
      
      onOpenChange(false);
      onDelete(); // Trigger refresh after dialog closes
    } catch (error) {
      console.error('Error in trainee deletion:', error);
      toast({
        title: "Error",
        description: "Failed to delete trainee. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Trainee</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this trainee? This action cannot be undone.
            The registration's payment amount will be automatically recalculated.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TraineeDeleteDialog;
