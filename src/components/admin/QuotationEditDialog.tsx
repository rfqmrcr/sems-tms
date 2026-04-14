import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
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
import { updateQuotation } from '@/services/quotationService';
import { Quotation, QuotationStatus } from '@/types/quotation';

// Hardcoded tax rates
const TAX_RATES = [
  { name: 'No Tax', rate: 0 },
  { name: 'Standard GST', rate: 8 },
  { name: 'Reduced Rate', rate: 3 },
  { name: 'Custom Rate', rate: 10 }
];

interface QuotationEditDialogProps {
  quotation: Quotation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const formSchema = z.object({
  quotation_number: z.string().min(1, 'Quotation number is required'),
  status: z.enum(['pending', 'accepted', 'rejected', 'expired', 'converted'] as const),
  issue_date: z.string().min(1, 'Issue date is required'),
  valid_until: z.string().min(1, 'Valid until date is required'),
  tax_rate: z.coerce.number().min(0, 'Tax rate must be at least 0'),
  subtotal: z.coerce.number().min(0, 'Subtotal must be at least 0'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const QuotationEditDialog: React.FC<QuotationEditDialogProps> = ({
  quotation,
  open,
  onOpenChange,
  onSave,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set up the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quotation_number: quotation.quotation_number,
      status: quotation.status,
      issue_date: format(new Date(quotation.issue_date), 'yyyy-MM-dd'),
      valid_until: format(new Date(quotation.valid_until), 'yyyy-MM-dd'),
      tax_rate: quotation.tax_rate,
      subtotal: quotation.subtotal,
      notes: quotation.notes || '',
    },
  });
  
  // Watch fields to recalculate tax amount and total
  const subtotal = form.watch('subtotal');
  const taxRate = form.watch('tax_rate');
  const [taxAmount, setTaxAmount] = useState(quotation.tax_amount);
  const [totalAmount, setTotalAmount] = useState(quotation.total_amount);
  
  // Update tax amount and total when subtotal or tax rate changes
  useEffect(() => {
    const calculatedTaxAmount = (subtotal * taxRate) / 100;
    setTaxAmount(calculatedTaxAmount);
    setTotalAmount(subtotal + calculatedTaxAmount);
  }, [subtotal, taxRate]);
  
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Calculate tax amount and total amount
      const calculatedTaxAmount = (data.subtotal * data.tax_rate) / 100;
      const calculatedTotalAmount = data.subtotal + calculatedTaxAmount;
      
      // Update the quotation
      await updateQuotation(quotation.id, {
        ...data,
        tax_amount: calculatedTaxAmount,
        total_amount: calculatedTotalAmount,
        status: data.status as QuotationStatus
      });
      
      toast({
        title: "Quotation updated",
        description: "The quotation has been updated successfully.",
      });
      
      // Close the dialog and refresh data
      onOpenChange(false);
      onSave();
    } catch (error) {
      console.error('Error updating quotation:', error);
      toast({
        title: "Error",
        description: "Failed to update quotation. Please try again.",
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
          <DialogTitle>Edit Quotation</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quotation_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quotation Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="issue_date"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Issue Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="valid_until"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Valid Until</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="subtotal"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Subtotal</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Tax Rate (%)</FormLabel>
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseFloat(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tax rate" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TAX_RATES.map((tax) => (
                          <SelectItem key={tax.name} value={tax.rate.toString()}>
                            {tax.name} ({tax.rate}%)
                          </SelectItem>
                        ))}
                        <SelectItem value={field.value.toString()}>
                          Custom ({field.value}%)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <FormLabel>Tax Amount</FormLabel>
                <Input type="text" value={`AED ${taxAmount.toFixed(2)}`} disabled />
...
                <Input type="text" value={`AED ${totalAmount.toFixed(2)}`} disabled />
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Textarea {...field} />
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
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationEditDialog;