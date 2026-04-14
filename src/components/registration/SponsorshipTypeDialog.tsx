
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
import { Building2, User } from 'lucide-react';

interface SponsorshipTypeDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectSponsorshipType: (type: 'corporate' | 'self') => void;
}

const SponsorshipTypeDialog: React.FC<SponsorshipTypeDialogProps> = ({
  open,
  onClose,
  onSelectSponsorshipType
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Sponsorship Type</DialogTitle>
          <DialogDescription>
            Please choose how you would like to register for this course.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Card 
            className="cursor-pointer transition-all hover:shadow-md hover:border-primary"
            onClick={() => onSelectSponsorshipType('corporate')}
          >
            <CardContent className="flex items-center p-4">
              <Building2 className="h-8 w-8 text-primary mr-4" />
              <div className="flex-1">
                <h3 className="font-semibold">Corporate Sponsored</h3>
                <p className="text-sm text-gray-600">
                  Your organization will handle the registration and payment
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:shadow-md hover:border-green-500"
            onClick={() => onSelectSponsorshipType('self')}
          >
            <CardContent className="flex items-center p-4">
              <User className="h-8 w-8 text-green-600 mr-4" />
              <div className="flex-1">
                <h3 className="font-semibold">Self Sponsored</h3>
                <p className="text-sm text-gray-600">
                  You will register and pay for yourself
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

export default SponsorshipTypeDialog;
