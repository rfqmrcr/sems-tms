import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, addDays } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { createInvoiceForRegistration, generateInvoiceNumber } from '@/services/invoiceService';
import { supabase } from '@/integrations/supabase/client';

interface InvoiceCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const formSchema = z.object({
  registration_id: z.string().min(1, 'Registration is required'),
  due_days: z.coerce.number().int().min(1, 'Due days must be at least 1'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const InvoiceCreateDialog: React.FC<InvoiceCreateDialogProps> = ({
  open,
  onOpenChange,
  onCreated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  
  // Set up the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      registration_id: '',
      due_days: 14,
      notes: '',
    },
  });
  
  // Fetch registrations
  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoadingRegistrations(true);
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select(`
            id,
            contact_person,
            contact_email,
            course_run_id,
            payment_status,
            course_runs (
              title,
              start_date
            )
          `)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setRegistrations(data || []);
      } catch (error) {
        console.error('Error fetching registrations:', error);
        toast({
          title: "Error",
          description: "Failed to load registrations. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingRegistrations(false);
      }
    };
    
    if (open) {
      fetchRegistrations();
    }
  }, [open]);
  
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create the invoice with tax settings
      await createInvoiceForRegistration(
        data.registration_id,
        data.notes,
        data.due_days
      );
      
      toast({
        title: "Invoice created",
        description: "The invoice has been created successfully.",
      });
      
      // Close the dialog and refresh data
      onOpenChange(false);
      onCreated();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getRegistrationLabel = (registration: any) => {
    const courseName = registration.course_runs?.title || 'Unknown Course';
    const contactName = registration.contact_person || 'Unknown Contact';
    const date = registration.course_runs?.start_date
      ? format(new Date(registration.course_runs.start_date), 'dd/MM/yyyy')
      : 'No date';
    
    return `${courseName} - ${contactName} (${date})`;
  };
  
  // Reset the form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      form.reset({
        registration_id: '',
        due_days: 14,
        notes: '',
      });
    }
  }, [open, form]);
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isSubmitting && onOpenChange(isOpen)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Select a registration and set payment terms for the new invoice.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="registration_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting || loadingRegistrations}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingRegistrations ? "Loading..." : "Select a registration"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {registrations.length === 0 && (
                        <SelectItem value="none">No registrations available</SelectItem>
                      )}
                      {registrations.map((registration) => (
                        <SelectItem key={registration.id} value={registration.id}>
                          {getRegistrationLabel(registration)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="due_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Due (Days)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Optional notes to appear on the invoice" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Invoice"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceCreateDialog;
