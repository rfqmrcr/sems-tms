import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
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
import { createQuotationForRegistration } from '@/services/quotationService';
import { supabase } from '@/integrations/supabase/client';

interface QuotationCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

interface Registration {
  id: string;
  contact_person: string;
  contact_email: string;
  organizations?: { name: string };
  courses?: { title: string };
}

const formSchema = z.object({
  registration_id: z.string().min(1, 'Registration is required'),
  notes: z.string().optional(),
  valid_for_days: z.coerce.number().min(1, 'Valid for days must be at least 1').default(30),
});

type FormValues = z.infer<typeof formSchema>;

const QuotationCreateDialog: React.FC<QuotationCreateDialogProps> = ({
  open,
  onOpenChange,
  onCreated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  
  // Set up the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: '',
      valid_for_days: 30,
    },
  });

  // Fetch registrations when dialog opens
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (open) {
        setLoadingRegistrations(true);
        try {
          const { data, error } = await supabase
            .from('registrations')
            .select(`
              id,
              contact_person,
              contact_email,
              organizations (name),
              courses (title)
            `)
            .order('created_at', { ascending: false });
            
          if (error) throw error;
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
      }
    };

    fetchRegistrations();
  }, [open]);
  
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      await createQuotationForRegistration(
        data.registration_id, 
        data.notes, 
        data.valid_for_days
      );
      
      toast({
        title: "Quotation created",
        description: "The quotation has been created successfully.",
      });
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      onCreated();
    } catch (error) {
      console.error('Error creating quotation:', error);
      toast({
        title: "Error",
        description: "Failed to create quotation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isSubmitting && onOpenChange(isOpen)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Quotation</DialogTitle>
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
                    disabled={loadingRegistrations || isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select registration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {registrations.map((registration) => (
                        <SelectItem key={registration.id} value={registration.id}>
                          {registration.contact_person} - {registration.organizations?.name || 'N/A'} 
                          ({registration.courses?.title || 'N/A'})
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
              name="valid_for_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valid for (days)</FormLabel>
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
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Additional notes for the quotation..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || loadingRegistrations}>
                {isSubmitting ? "Creating..." : "Create Quotation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationCreateDialog;