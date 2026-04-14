import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PromoCode } from '@/hooks/usePromoCodeData';
import { format } from 'date-fns';
import { Calendar, Percent, Eye, Target, Building, User } from 'lucide-react';

interface PromoCodeViewDialogProps {
  promoCode: PromoCode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PromoCodeViewDialog: React.FC<PromoCodeViewDialogProps> = ({
  promoCode,
  open,
  onOpenChange,
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fixed_amount':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (isActive: boolean, validUntil: string) => {
    if (!isActive) return 'bg-red-100 text-red-800 border-red-200';
    
    const now = new Date();
    const endDate = new Date(validUntil);
    
    if (endDate < now) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatusText = (isActive: boolean, validUntil: string) => {
    if (!isActive) return 'Inactive';
    
    const now = new Date();
    const endDate = new Date(validUntil);
    
    if (endDate < now) return 'Expired';
    return 'Active';
  };

  const getUsagePercentage = () => {
    if (!promoCode.usage_limit) return null;
    return Math.round((promoCode.usage_count / promoCode.usage_limit) * 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Promo Code Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about the promo code "{promoCode.code}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Code</label>
                  <div className="font-mono font-semibold text-lg">{promoCode.code}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(promoCode.is_active, promoCode.valid_until)}
                    >
                      {getStatusText(promoCode.is_active, promoCode.valid_until)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <div>
                    <Badge 
                      variant="outline" 
                      className={getTypeColor(promoCode.type)}
                    >
                      {promoCode.type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Discount</label>
                  <div className="flex items-center gap-1">
                    <Percent className="h-4 w-4" />
                    <span className="font-semibold">{promoCode.percentage}%</span>
                  </div>
                </div>
              </div>

              {promoCode.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm mt-1">{promoCode.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validity Period */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Validity Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Valid From</label>
                  <div className="font-medium">
                    {format(new Date(promoCode.valid_from), 'dd MMMM yyyy')}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Valid Until</label>
                  <div className="font-medium">
                    {format(new Date(promoCode.valid_until), 'dd MMMM yyyy')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Usage Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Times Used</label>
                    <div className="text-2xl font-bold">{promoCode.usage_count}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Usage Limit</label>
                    <div className="text-2xl font-bold">
                      {promoCode.usage_limit || '∞'}
                    </div>
                  </div>
                </div>

                {promoCode.usage_limit && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Usage Progress</span>
                      <span>{getUsagePercentage()}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${getUsagePercentage()}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Applicability Filters</CardTitle>
              <CardDescription>
                Conditions that determine when this promo code can be used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Course Visibility
                  </label>
                  <Badge variant="secondary" className="mt-1">
                    {promoCode.course_visibility_filter === 'both' 
                      ? 'All Course Types' 
                      : `${promoCode.course_visibility_filter} Courses Only`}
                  </Badge>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Sponsorship Type
                  </label>
                  <Badge variant="secondary" className="mt-1">
                    {promoCode.sponsorship_type_filter === 'both' 
                      ? 'All Sponsorship Types' 
                      : `${promoCode.sponsorship_type_filter}-Sponsored Only`}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timestamps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-muted-foreground">Created At</label>
                  <div>{format(new Date(promoCode.created_at), 'dd/MM/yyyy HH:mm:ss')}</div>
                </div>
                <div>
                  <label className="text-muted-foreground">Last Updated</label>
                  <div>{format(new Date(promoCode.updated_at), 'dd/MM/yyyy HH:mm:ss')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromoCodeViewDialog;