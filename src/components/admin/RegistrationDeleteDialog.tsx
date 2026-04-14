
import React from 'react';
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

interface RegistrationDeleteDialogProps {
  registrationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

const RegistrationDeleteDialog: React.FC<RegistrationDeleteDialogProps> = ({
  registrationId,
  open,
  onOpenChange,
  onDelete,
}) => {
  const handleDelete = async () => {
    try {
      // First delete email logs associated with this registration
      const { error: emailLogsError } = await supabase
        .from('email_logs')
        .delete()
        .eq('registration_id', registrationId);

      if (emailLogsError) throw emailLogsError;

      // Then delete the trainees associated with this registration
      const { error: traineesError } = await supabase
        .from('trainees')
        .delete()
        .eq('registration_id', registrationId);

      if (traineesError) throw traineesError;

      // Finally delete the registration
      const { error: registrationError } = await supabase
        .from('registrations')
        .delete()
        .eq('id', registrationId);

      if (registrationError) throw registrationError;

      toast({
        title: "Registration deleted",
        description: "The registration and associated data have been deleted."
      });
      
      onDelete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting registration:', error);
      toast({
        title: "Error",
        description: "Failed to delete registration. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the registration
            and all associated participant data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RegistrationDeleteDialog;
