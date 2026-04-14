import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Partner } from '@/types/partner';
import { format } from 'date-fns';
import { Building2, Mail, Phone, User, MapPin, Calendar } from 'lucide-react';

interface PartnerViewDialogProps {
  partner: Partner;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PartnerViewDialog: React.FC<PartnerViewDialogProps> = ({
  partner,
  open,
  onOpenChange,
}) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Tier 1':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Tier 2':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Tier 3':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Partner Details
          </DialogTitle>
          <DialogDescription>
            Complete information for {partner.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between p-4 bg-muted rounded-lg">
            <div>
              <h3 className="text-lg font-semibold">{partner.name}</h3>
              <p className="font-mono text-sm text-muted-foreground">
                Code: {partner.partner_code}
              </p>
            </div>
            <Badge variant="outline" className={getTierColor(partner.tier)}>
              {partner.tier}
            </Badge>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Contact Information
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Primary Contact</p>
                    <p className="text-sm text-muted-foreground">{partner.contact_person_1}</p>
                  </div>
                </div>

                {partner.contact_person_2 && (
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Secondary Contact</p>
                      <p className="text-sm text-muted-foreground">{partner.contact_person_2}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{partner.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Primary Phone</p>
                    <p className="text-sm text-muted-foreground">{partner.contact_number_1}</p>
                  </div>
                </div>

                {partner.contact_number_2 && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Secondary Phone</p>
                      <p className="text-sm text-muted-foreground">{partner.contact_number_2}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Organization Details
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {partner.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(partner.created_at), 'PPP')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(partner.updated_at), 'PPP')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerViewDialog;