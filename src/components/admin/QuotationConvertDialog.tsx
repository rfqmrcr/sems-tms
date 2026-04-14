import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { convertQuotationToInvoice } from '@/services/quotationService';
import { Quotation } from '@/types/quotation';

interface QuotationConvertDialogProps {
  quotation: Quotation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConverted: () => void;
}

const formSchema = z.object({
  notes: z.string().optional(),
  due_in_days: z.coerce.number().min(1, 'Due in days must be at least 1').default(14),
});

type FormValues = z.infer<typeof formSchema>;

const QuotationConvertDialog: React.FC<QuotationConvertDialogProps> = ({
  quotation,
  open,
  onOpenChange,
  onConverted,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set up the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: '',
      due_in_days: 14,
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      await convertQuotationToInvoice(
        quotation.id, 
        data.notes, 
        data.due_in_days
      );
      
      toast({
        title: "Quotation converted",
        description: "The quotation has been converted to an invoice successfully.",
      });
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      onConverted();
    } catch (error) {
      console.error('Error converting quotation:', error);
      toast({
        title: "Error",
        description: "Failed to convert quotation to invoice. Please try again.",
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
          <DialogTitle>Convert Quotation to Invoice</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            Converting quotation #{quotation.quotation_number} to an invoice.
            The quotation will be marked as "converted" and linked to the new invoice.
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="due_in_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Due in (days)</FormLabel>
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
                  <FormLabel>Invoice Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Additional notes for the invoice..." />
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
                {isSubmitting ? "Converting..." : "Convert to Invoice"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationConvertDialog;