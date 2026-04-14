import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PromoCode } from '@/hooks/usePromoCodeData';

const promoCodeSchema = z
  .object({
    code: z.string().min(1, 'Code is required').toUpperCase(),
    type: z.enum(['fixed_amount', 'percentage']),
    percentage: z.coerce
      .number()
      .min(0.1, 'Value must be greater than 0'),
    valid_from: z.string().min(1, 'Start date is required'),
    valid_until: z.string().min(1, 'End date is required'),
    usage_limit: z.coerce.number().nullable().optional(),
    course_visibility_filter: z.enum(['public', 'private', 'both']),
    sponsorship_type_filter: z.enum(['self', 'corporate', 'both']),
    is_active: z.boolean(),
    description: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Only enforce max 100 when type is percentage
    if (data.type === 'percentage' && typeof data.percentage === 'number' && data.percentage > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['percentage'],
        message: 'Percentage cannot exceed 100',
      });
    }
  });

type PromoCodeFormData = z.infer<typeof promoCodeSchema>;

interface PromoCodeCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<PromoCode, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => void;
  isLoading: boolean;
}

const PromoCodeCreateDialog: React.FC<PromoCodeCreateDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}) => {
  const form = useForm<PromoCodeFormData>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: {
      code: '',
      type: 'percentage',
      percentage: 10,
      valid_from: '',
      valid_until: '',
      usage_limit: null,
      course_visibility_filter: 'both',
      sponsorship_type_filter: 'both',
      is_active: true,
      description: '',
    },
  });

  const selectedType = form.watch('type');

  const handleSubmit = (data: PromoCodeFormData) => {
    onSubmit({
      code: data.code,
      type: data.type,
      percentage: data.percentage,
      valid_from: data.valid_from,
      valid_until: data.valid_until,
      usage_limit: data.usage_limit || null,
      course_visibility_filter: data.course_visibility_filter,
      sponsorship_type_filter: data.sponsorship_type_filter,
      is_active: data.is_active,
      description: data.description || null,
    });
  };

  // Reset form when dialog closes successfully
  React.useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Promo Code</DialogTitle>
          <DialogDescription>
            Create a new promotional code for discounts.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promo Code *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., SUMMER2024" 
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select promo code type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage Discount</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {selectedType === 'fixed_amount' ? 'Discount Amount *' : 'Discount Percentage *'}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0.1" 
                      max={selectedType === 'percentage' ? "100" : undefined}
                      step="0.1" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valid_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid From *</FormLabel>
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
                  <FormItem>
                    <FormLabel>Valid Until *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="usage_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usage Limit (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      placeholder="Leave empty for unlimited usage"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="course_visibility_filter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Visibility Filter</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="both">Both Public & Private</SelectItem>
                      <SelectItem value="public">Public Courses Only</SelectItem>
                      <SelectItem value="private">Private Courses Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sponsorship_type_filter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sponsorship Type Filter</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="both">Both Self & Corporate</SelectItem>
                      <SelectItem value="self">Self-Sponsored Only</SelectItem>
                      <SelectItem value="corporate">Corporate-Sponsored Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable this promo code for use
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of this promo code..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Promo Code'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PromoCodeCreateDialog;