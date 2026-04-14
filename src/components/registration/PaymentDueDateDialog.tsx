
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Calendar } from 'lucide-react';
import { format, isValid } from 'date-fns';

interface PaymentDueDateDialogProps {
  open: boolean;
  onClose: () => void;
  onAcceptSuggestedDate: () => void;
  onKeepOriginalDate: () => void;
  currentCourseDate: string;
  suggestedDate: string;
  paymentTerms: string;
}

const PaymentDueDateDialog: React.FC<PaymentDueDateDialogProps> = ({
  open,
  onClose,
  onAcceptSuggestedDate,
  onKeepOriginalDate,
  currentCourseDate,
  suggestedDate,
  paymentTerms
}) => {
  const formatPaymentTerms = (terms: string) => {
    switch (terms) {
      case 'immediate':
        return 'immediate payment';
      case '14_days':
        return '14 days';
      case '30_days':
        return '30 days';
      default:
        return terms;
    }
  };

  // Helper function to safely format dates
  const safeFormatDate = (dateString: string, formatStr: string = 'PPP') => {
    if (!dateString) return 'Invalid date';
    
    const date = new Date(dateString);
    if (!isValid(date)) return 'Invalid date';
    
    try {
      return format(date, formatStr);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  // Don't render if dates are invalid
  if (!currentCourseDate || !suggestedDate) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Payment Schedule Conflict
          </DialogTitle>
          <DialogDescription>
            There's a potential issue with your payment timeline and course start date.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              With {formatPaymentTerms(paymentTerms)} payment terms, your payment may not be processed before the course starts on {safeFormatDate(currentCourseDate)}.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Current course date: {safeFormatDate(currentCourseDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Calendar className="h-4 w-4" />
              <span>Suggested course date: {safeFormatDate(suggestedDate)}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            We recommend choosing a course date that allows sufficient time for payment processing to ensure your registration is confirmed before the course begins.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-4">
          <Button onClick={onAcceptSuggestedDate} className="w-full">
            Use Suggested Date ({safeFormatDate(suggestedDate, 'MMM dd, yyyy')})
          </Button>
          <Button variant="outline" onClick={onKeepOriginalDate} className="w-full">
            Keep Original Date
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDueDateDialog;
