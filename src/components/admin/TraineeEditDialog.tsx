
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/form/InputField';
import { SelectField } from '@/components/form/SelectField';
import { DatePickerField } from '@/components/form/DatePickerField';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Trainee } from '@/hooks/useTraineesData';

interface TraineeEditDialogProps {
  trainee: Trainee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  nric: z.string().nullable().optional(),
  dob: z.date().nullable().optional(),
  gender: z.string().nullable().optional(),
  contact_number: z.string().nullable().optional(),
  email: z.string().email('Invalid email format').nullable().optional(),
});

type FormValues = z.infer<typeof schema>;

const TraineeEditDialog: React.FC<TraineeEditDialogProps> = ({
  trainee,
  open,
  onOpenChange,
  onSave,
}) => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: trainee.full_name || '',
      nric: trainee.nric || '',
      dob: trainee.dob ? new Date(trainee.dob) : null,
      gender: trainee.gender || '',
      contact_number: trainee.contact_number || '',
      email: trainee.email || '',
    },
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit = async (data: FormValues) => {
    try {
      const { error } = await supabase
        .from('trainees')
        .update({
          full_name: data.full_name,
          nric: data.nric || null,
          dob: data.dob ? format(data.dob, 'yyyy-MM-dd') : null,
          gender: data.gender || null,
          contact_number: data.contact_number || null,
          email: data.email || null,
        })
        .eq('id', trainee.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Trainee updated",
        description: "The trainee information has been updated successfully."
      });
      
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating trainee:', error);
      toast({
        title: "Error",
        description: "Failed to update trainee information. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Trainee</DialogTitle>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4">
              <InputField
                name="full_name"
                label="Full Name"
                required
              />
              
              <InputField
                name="nric"
                label="MyKad No./Passport No."
              />
              
              <DatePickerField
                name="dob"
                label="Date of Birth"
              />
              
              <SelectField
                name="gender"
                label="Gender"
                options={genderOptions}
                placeholder="Select gender"
              />
              
              <InputField
                name="contact_number"
                label="Contact Number"
              />
              
              <InputField
                name="email"
                label="Email"
                type="email"
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default TraineeEditDialog;
