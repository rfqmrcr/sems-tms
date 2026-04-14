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
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

interface RegistrationEditDialogProps {
  registration: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const paymentStatusOptions = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'unpaid', label: 'Unpaid' },
];

const paymentTypeOptions = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'online_payment', label: 'Online Payment' },
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
];

const cmeSalesRepOptions = [
  { value: 'Isaac', label: 'Isaac' },
];

const schema = z.object({
  payment_status: z.string(),
  payment_type: z.string().optional(),
  payment_amount: z.coerce.number().min(0, 'Amount must be a positive number'),
  cme_sales_representative: z.string().optional(),
  qbo_invoice_number: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const RegistrationEditDialog: React.FC<RegistrationEditDialogProps> = ({
  registration,
  open,
  onOpenChange,
  onSave,
}) => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      payment_status: registration.payment_status || 'unpaid',
      payment_type: registration.payment_type || '',
      payment_amount: registration.payment_amount || 0,
      cme_sales_representative: registration.cme_sales_representative || '',
      qbo_invoice_number: registration.qbo_invoice_number || '',
    },
  });

  const { handleSubmit, formState: { isSubmitting }, watch, setValue } = methods;

  const onSubmit = async (data: FormValues) => {
    try {
      console.log('Submitting registration update:', data);
      
      const updateData: any = {
        payment_status: data.payment_status,
        payment_amount: Number(data.payment_amount),
        hrdf_grant: false, // No longer applicable - removed from UI
      };

      // Only include payment_type if it's not empty
      if (data.payment_type && data.payment_type.trim() !== '') {
        updateData.payment_type = data.payment_type;
      }

      // Only include cme_sales_representative if it's not empty
      if (data.cme_sales_representative && data.cme_sales_representative.trim() !== '') {
        updateData.cme_sales_representative = data.cme_sales_representative;
      }

      // Only include qbo_invoice_number if it's not empty
      if (data.qbo_invoice_number && data.qbo_invoice_number.trim() !== '') {
        updateData.qbo_invoice_number = data.qbo_invoice_number;
      }

      const { error } = await supabase
        .from('registrations')
        .update(updateData)
        .eq('id', registration.id);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      toast({
        title: "Registration updated",
        description: "The registration has been updated successfully."
      });
      
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating registration:', error);
      toast({
        title: "Error",
        description: "Failed to update registration. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Registration</DialogTitle>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <h3 className="font-medium mb-2">Registration Details</h3>
                <div className="text-sm text-gray-500 space-y-1">
                  <p className="font-semibold">Registration ID: {registration.custom_registration_id || registration.id.substring(0, 8) + '...'}</p>
                  <p>Contact: {registration.contact_name}</p>
                  <p>Email: {registration.email}</p>
                  <p>Phone: {registration.phone}</p>
                  <p>Company: {registration.company_name}</p>
                  <p>Course: {registration.course_name}</p>
                  <p>Registration Date: {format(new Date(registration.created_at), 'MMM d, yyyy h:mm a')}</p>
                  <p>Course Date: {
                    registration.course_start_date && registration.course_end_date
                      ? `${format(new Date(registration.course_start_date), 'dd MMM yyyy')} - ${format(new Date(registration.course_end_date), 'dd MMM yyyy')}`
                      : 'N/A'
                  }</p>
                  <p>Participants: {registration.participant_count}</p>
                </div>
              </div>
              
              <SelectField
                name="payment_status"
                label="Payment Status"
                options={paymentStatusOptions}
              />
              
              <SelectField
                name="payment_type"
                label="Payment Type"
                options={paymentTypeOptions}
                placeholder="Select payment type (optional)"
              />
              
              <InputField
                name="payment_amount"
                label="Payment Amount"
                type="number"
                step="0.01"
                min="0"
              />
              
               <SelectField
                name="cme_sales_representative"
                label="CME/Sales Representative"
                options={cmeSalesRepOptions}
                placeholder="Select representative (optional)"
              />

              <InputField
                name="qbo_invoice_number"
                label="QBO Invoice Number"
                type="text"
                placeholder="Enter QBO invoice number (optional)"
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

export default RegistrationEditDialog;
