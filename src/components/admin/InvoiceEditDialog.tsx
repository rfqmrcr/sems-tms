
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
import { updateInvoice } from '@/services/invoiceService';
import { Invoice, InvoiceStatus } from '@/types/invoice';

// Hardcoded tax rates
const TAX_RATES = [
  { name: 'No Tax', rate: 0 },
  { name: 'Standard GST', rate: 8 },
  { name: 'Reduced Rate', rate: 3 },
  { name: 'Custom Rate', rate: 10 }
];

interface InvoiceEditDialogProps {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const formSchema = z.object({
  invoice_number: z.string().min(1, 'Invoice number is required'),
  status: z.enum(['pending', 'paid', 'overdue', 'cancelled'] as const),
  issue_date: z.string().min(1, 'Issue date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  tax_rate: z.coerce.number().min(0, 'Tax rate must be at least 0'),
  subtotal: z.coerce.number().min(0, 'Subtotal must be at least 0'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const InvoiceEditDialog: React.FC<InvoiceEditDialogProps> = ({
  invoice,
  open,
  onOpenChange,
  onSave,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set up the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoice_number: invoice.invoice_number,
      status: invoice.status,
      issue_date: format(new Date(invoice.issue_date), 'yyyy-MM-dd'),
      due_date: format(new Date(invoice.due_date), 'yyyy-MM-dd'),
      tax_rate: invoice.tax_rate,
      subtotal: invoice.subtotal,
      notes: invoice.notes || '',
    },
  });
  
  // Watch fields to recalculate tax amount and total
  const subtotal = form.watch('subtotal');
  const taxRate = form.watch('tax_rate');
  const [taxAmount, setTaxAmount] = useState(invoice.tax_amount);
  const [totalAmount, setTotalAmount] = useState(invoice.total_amount);
  
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
      
      // Update the invoice
      await updateInvoice(invoice.id, {
        ...data,
        tax_amount: calculatedTaxAmount,
        total_amount: calculatedTotalAmount,
        status: data.status as InvoiceStatus
      });
      
      toast({
        title: "Invoice updated",
        description: "The invoice has been updated successfully.",
      });
      
      // Close the dialog and refresh data
      onOpenChange(false);
      onSave();
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
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
          <DialogTitle>Edit Invoice</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="invoice_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number</FormLabel>
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
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Due Date</FormLabel>
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
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
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

export default InvoiceEditDialog;
