import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Partner } from '@/types/partner';

interface PartnerDeleteDialogProps {
  partner: Partner;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const PartnerDeleteDialog: React.FC<PartnerDeleteDialogProps> = ({
  partner,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}) => {
  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Partner
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this partner? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 border rounded-lg bg-red-50 border-red-200">
          <div className="space-y-2">
            <p><strong>Partner Code:</strong> {partner.partner_code}</p>
            <p><strong>Organization:</strong> {partner.name}</p>
            <p><strong>Tier:</strong> {partner.tier}</p>
            <p><strong>Contact:</strong> {partner.contact_person_1}</p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Partner'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerDeleteDialog;