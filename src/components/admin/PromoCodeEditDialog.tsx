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

const promoCodeSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  type: z.enum(['fixed_amount', 'percentage']),
  percentage: z.coerce.number().min(0.1, 'Percentage must be greater than 0').max(100, 'Percentage cannot exceed 100'),
  valid_from: z.string().min(1, 'Start date is required'),
  valid_until: z.string().min(1, 'End date is required'),
  usage_limit: z.coerce.number().nullable().optional(),
  usage_count: z.number(),
  course_visibility_filter: z.enum(['public', 'private', 'both']),
  sponsorship_type_filter: z.enum(['self', 'corporate', 'both']),
  is_active: z.boolean(),
  description: z.string().optional(),
});

type PromoCodeFormData = z.infer<typeof promoCodeSchema>;

interface PromoCodeEditDialogProps {
  promoCode: PromoCode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PromoCode) => void;
  isLoading: boolean;
}

const PromoCodeEditDialog: React.FC<PromoCodeEditDialogProps> = ({
  promoCode,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}) => {
  const form = useForm<PromoCodeFormData>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: {
      code: promoCode.code,
      type: promoCode.type,
      percentage: promoCode.percentage,
      valid_from: promoCode.valid_from,
      valid_until: promoCode.valid_until,
      usage_limit: promoCode.usage_limit,
      usage_count: promoCode.usage_count,
      course_visibility_filter: promoCode.course_visibility_filter,
      sponsorship_type_filter: promoCode.sponsorship_type_filter,
      is_active: promoCode.is_active,
      description: promoCode.description || '',
    },
  });

  const handleSubmit = (data: PromoCodeFormData) => {
    onSubmit({
      ...promoCode,
      ...data,
      usage_limit: data.usage_limit || null,
      description: data.description || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Promo Code</DialogTitle>
          <DialogDescription>
            Update the promotional code details.
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                  <FormLabel>Discount Percentage *</FormLabel>
                  <FormControl>
                    <Input type="number" min="0.1" max="100" step="0.1" {...field} />
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
              name="usage_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usage Count</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                {isLoading ? 'Updating...' : 'Update Promo Code'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PromoCodeEditDialog;