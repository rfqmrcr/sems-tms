
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Building, User, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { RegistrationSummaryProps } from '@/types/registration';
import { Separator } from '@/components/ui/separator';
import { DiscountSection } from '@/components/registration/DiscountSection';
import { DiscountCalculation } from '@/types/discount';
import DailyScheduleDisplay from '@/components/DailyScheduleDisplay';

const RegistrationSummary: React.FC<RegistrationSummaryProps> = ({
  selectedCourse,
  organization,
  contact,
  trainees,
  calculateTotal,
  getFinalAmount,
  getFinalAmountWithTax,
  sponsorshipType,
  discountCalculation,
  onPromoCodeChange
}) => {
  const formatCurrency = (amount: number) => {
    return `AED ${amount.toFixed(2)}`;
  };

  const getLocationDisplay = (location: string | null | undefined) => {
    return location || 'To be confirmed';
  };

  const getPriceDisplay = () => {
    if (selectedCourse?.price) return formatCurrency(selectedCourse.price);
    return 'Contact for pricing';
  };

  const getPaymentTermsText = (terms: string) => {
    switch (terms) {
      case 'net_0': return 'Payment upon registration';
      case 'net_14': return 'Payment within 14 days';
      case 'net_30': return 'Payment within 30 days';
      case 'net_60': return 'Payment within 60 days';
      default: return 'N/A';
    }
  };

  const getSubtotalAmount = () => {
    return discountCalculation?.finalAmount || calculateTotal();
  };

  const getTaxSetting = () => {
    return 5; // Tax rate for UAE
  };

  const getTaxAmount = () => {
    const subtotal = getSubtotalAmount();
    return subtotal * (getTaxSetting() / 100);
  };

  const getTotalWithTax = () => {
    return getFinalAmountWithTax();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Registration Summary</h2>
        <p className="text-gray-600">Please review your registration details before submitting.</p>
      </div>

      {/* Course Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Course Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="font-medium">Course:</span>
            <span>{selectedCourse?.course?.title}</span>
          </div>
          
          {selectedCourse?.schedules && selectedCourse.schedules.length > 0 ? (
            <div className="text-left">
              <span className="font-medium block mb-2 text-left">Schedule:</span>
              <DailyScheduleDisplay 
                schedules={selectedCourse.schedules} 
                compact={false}
              />
            </div>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="font-medium">Start Date:</span>
                <span>{selectedCourse ? format(new Date(selectedCourse.start_date), 'dd/MM/yyyy') : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">End Date:</span>
                <span>{selectedCourse ? format(new Date(selectedCourse.end_date), 'dd/MM/yyyy') : 'N/A'}</span>
              </div>
            </>
          )}
          
          <div className="flex justify-between">
            <span className="font-medium">Location:</span>
            <span>{getLocationDisplay(selectedCourse?.location)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Price per person:</span>
            <span>{getPriceDisplay()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Organization Information (only for corporate) */}
      {sponsorshipType === 'corporate' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Organization Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Organization:</span>
              <span>{organization.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Address:</span>
              <span>{organization.address || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Contact Person:</span>
              <span>{organization.contact_person}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Contact Email:</span>
              <span>{organization.contact_email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Contact Number:</span>
              <span>{organization.contact_number || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information (only for corporate) */}
      {sponsorshipType === 'corporate' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Contact Person:</span>
              <span>{contact.contact_person}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{contact.contact_email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Phone:</span>
              <span>{contact.contact_number || 'N/A'}</span>
            </div>
            {/* Show payment terms for corporate registrations */}
            {sponsorshipType === 'corporate' && (
              <div className="flex justify-between">
                <span className="font-medium">Payment Terms:</span>
                <span>{getPaymentTermsText((contact as any).payment_terms)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Trainee Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            {sponsorshipType === 'self' ? 'Personal Information' : 'Trainee Information'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trainees.map((trainee, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg">
              <h4 className="font-medium mb-2">
                {sponsorshipType === 'self' ? 'Your Details' : `Trainee ${index + 1}`}
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{trainee.full_name}</span>
                </div>
                {trainee.nric && (
                  <div className="flex justify-between">
                    <span className="font-medium">NRIC:</span>
                    <span>{trainee.nric}</span>
                  </div>
                )}
                {trainee.email && (
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{trainee.email}</span>
                  </div>
                )}
                {trainee.contact_number && (
                  <div className="flex justify-between">
                    <span className="font-medium">Phone:</span>
                    <span>{trainee.contact_number}</span>
                  </div>
                )}
                {trainee.dob && (
                  <div className="flex justify-between">
                    <span className="font-medium">Date of Birth:</span>
                    <span>{format(new Date(trainee.dob), 'dd/MM/yyyy')}</span>
                  </div>
                )}
                {trainee.gender && (
                  <div className="flex justify-between">
                    <span className="font-medium">Gender:</span>
                    <span>{trainee.gender}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Discount Section */}
      {onPromoCodeChange && (
        <DiscountSection
          discountCalculation={discountCalculation}
          onPromoCodeChange={onPromoCodeChange}
          courseVisibility={selectedCourse?.visibility || 'public'}
          sponsorshipType={sponsorshipType}
        />
      )}

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Number of Trainees:</span>
            <span>{trainees.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Price per person:</span>
            <span>{getPriceDisplay()}</span>
          </div>
          {discountCalculation && (
            <>
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span>{formatCurrency(discountCalculation.originalAmount)}</span>
              </div>
              {discountCalculation.totalDiscount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount ({discountCalculation.totalDiscount}%):</span>
                  <span>-{formatCurrency(discountCalculation.discountBreakdown.totalDiscountAmount)}</span>
                </div>
              )}
            </>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal:</span>
            <span>{formatCurrency(getSubtotalAmount())}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax ({getTaxSetting()}%):</span>
            <span>{formatCurrency(getTaxAmount())}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount (inc. tax):</span>
            <span>{formatCurrency(getTotalWithTax())}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationSummary;
