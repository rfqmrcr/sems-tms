
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
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TaxSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  taxRate: z.coerce.number()
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%'),
  taxName: z.string().min(1, 'Tax name is required'),
});

const TaxSettingsDialog: React.FC<TaxSettingsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set up the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taxRate: 8,
      taxName: 'Standard GST',
    },
  });

  // Load current tax settings
  useEffect(() => {
    if (open) {
      // Load from localStorage or API
      const savedTaxRate = localStorage.getItem('taxRate');
      const savedTaxName = localStorage.getItem('taxName');
      
      form.reset({
        taxRate: savedTaxRate ? parseFloat(savedTaxRate) : 8,
        taxName: savedTaxName || 'Standard GST',
      });
    }
  }, [open, form]);
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Save to localStorage for simplicity
      localStorage.setItem('taxRate', data.taxRate.toString());
      localStorage.setItem('taxName', data.taxName);
      
      toast({
        title: "Tax settings updated",
        description: `Tax rate set to ${data.taxRate}% (${data.taxName})`,
      });
      
      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating tax settings:', error);
      toast({
        title: "Error",
        description: "Failed to update tax settings.",
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
          <DialogTitle>Tax Settings</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="taxName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Standard GST" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="taxRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" max="100" {...field} />
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

export default TaxSettingsDialog;
