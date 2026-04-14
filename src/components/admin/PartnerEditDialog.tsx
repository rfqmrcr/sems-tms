import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Partner } from '@/types/partner';

interface PartnerEditDialogProps {
  partner: Partner;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partner) => void;
  isLoading: boolean;
}

const PartnerEditDialog: React.FC<PartnerEditDialogProps> = ({
  partner,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}) => {
  const form = useForm({
    defaultValues: {
      id: partner.id,
      name: partner.name,
      partner_code: partner.partner_code,
      tier: partner.tier,
      address: partner.address,
      contact_person_1: partner.contact_person_1,
      contact_person_2: partner.contact_person_2 || '',
      email: partner.email,
      contact_number_1: partner.contact_number_1,
      contact_number_2: partner.contact_number_2 || '',
      created_at: partner.created_at,
      updated_at: partner.updated_at,
    },
  });

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Partner</DialogTitle>
          <DialogDescription>
            Update partner organization details and tier assignment.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter organization name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tier *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Tier 1">Tier 1</SelectItem>
                        <SelectItem value="Tier 2">Tier 2</SelectItem>
                        <SelectItem value="Tier 3">Tier 3</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium text-muted-foreground">Partner Code</p>
              <p className="font-mono text-lg">{partner.partner_code}</p>
              <p className="text-xs text-muted-foreground">Partner codes cannot be modified</p>
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter complete address"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact_person_1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person 1 *</FormLabel>
                    <FormControl>
                      <Input placeholder="Primary contact person" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_person_2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Secondary contact person (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="organization@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact_number_1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number 1 *</FormLabel>
                    <FormControl>
                      <Input placeholder="Primary contact number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_number_2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Secondary contact number (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Partner'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerEditDialog;