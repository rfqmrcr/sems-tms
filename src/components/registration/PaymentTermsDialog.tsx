
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Calendar } from 'lucide-react';

interface PaymentTermsDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectPaymentTerms: (terms: 'immediate' | '14_days' | '30_days') => void;
}

const PaymentTermsDialog: React.FC<PaymentTermsDialogProps> = ({
  open,
  onClose,
  onSelectPaymentTerms
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Payment Terms</DialogTitle>
          <DialogDescription>
            Choose your preferred payment terms for this registration.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Card 
            className="cursor-pointer transition-all hover:shadow-md hover:border-green-500"
            onClick={() => onSelectPaymentTerms('immediate')}
          >
            <CardContent className="flex items-center p-4">
              <CreditCard className="h-8 w-8 text-green-600 mr-4" />
              <div className="flex-1">
                <h3 className="font-semibold">Pay Immediately</h3>
                <p className="text-sm text-gray-600">
                  Complete payment now to secure your registration
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:shadow-md hover:border-primary"
            onClick={() => onSelectPaymentTerms('14_days')}
          >
            <CardContent className="flex items-center p-4">
              <Calendar className="h-8 w-8 text-primary mr-4" />
              <div className="flex-1">
                <h3 className="font-semibold">14 Days Credit Terms</h3>
                <p className="text-sm text-gray-600">
                  Payment due within 14 days of invoice date
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentTermsDialog;
