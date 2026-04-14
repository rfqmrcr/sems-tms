import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PromoCode } from '@/hooks/usePromoCodeData';

interface PromoCodeDeleteDialogProps {
  promoCode: PromoCode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const PromoCodeDeleteDialog: React.FC<PromoCodeDeleteDialogProps> = ({
  promoCode,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Promo Code</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the promo code <strong>"{promoCode.code}"</strong>? 
            This action cannot be undone and will permanently remove the promo code and all its usage data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PromoCodeDeleteDialog;