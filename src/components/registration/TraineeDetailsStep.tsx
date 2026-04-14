
import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trainee } from '@/services/courseService';

interface TraineeDetailsStepProps {
  trainees: Trainee[];
  handleAddTrainee: () => void;
  handleRemoveTrainee: (index: number) => void;
  handleTraineeChange: (index: number, field: keyof Trainee, value: string | boolean) => void;
  sponsorshipType?: 'corporate' | 'self' | null;
  contact?: { hrdf_grant?: boolean };
}

const TraineeDetailsStep: React.FC<TraineeDetailsStepProps> = ({
  trainees,
  handleAddTrainee,
  handleRemoveTrainee,
  handleTraineeChange,
  sponsorshipType,
  contact
}) => {
  // For self-sponsored, ensure there's at least one trainee and limit to one
  useEffect(() => {
    if (sponsorshipType === 'self' && trainees.length === 0) {
      handleAddTrainee();
    }
  }, [sponsorshipType, trainees.length, handleAddTrainee]);

  const isSelfSponsored = sponsorshipType === 'self';
  const isCorporateWithHRDF = sponsorshipType === 'corporate' && contact?.hrdf_grant;

  // MyKad validation function
  const validateMyKad = (value: string): boolean => {
    const myKadPattern = /^\d{6}-\d{2}-\d{4}$/;
    return myKadPattern.test(value);
  };

  const handleNricChange = (index: number, value: string) => {
    // If corporate with HRDF, validate MyKad format
    if (isCorporateWithHRDF && value && !validateMyKad(value)) {
      // You could show an error message here if needed
      console.log('Invalid MyKad format. Expected format: XXXXXX-XX-XXXX');
    }
    handleTraineeChange(index, 'nric', value);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">
        {isSelfSponsored ? 'Your Details' : 'Trainee Details'}
      </h2>
      
      {isSelfSponsored && (
        <p className="text-gray-600 mb-6">
          Please provide your personal details for the course registration.
        </p>
      )}

      {isCorporateWithHRDF && (
        <p className="text-primary mb-6">
          <strong>Note:</strong> For HRDC grant applications, please use MyKad format (XXXXXX-XX-XXXX) for identification.
        </p>
      )}
      
      <div className="space-y-6">
        {trainees.map((trainee, index) => (
          <div key={index} className="border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {isSelfSponsored ? 'Personal Information' : `Trainee ${index + 1}`}
              </h3>
              {!isSelfSponsored && trainees.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveTrainee(index)}
                >
                  Remove
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`trainee-${index}-name`}>Full Name *</Label>
                <Input
                  id={`trainee-${index}-name`}
                  value={trainee.full_name}
                  onChange={(e) => handleTraineeChange(index, 'full_name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor={`trainee-${index}-phone`}>Contact Number *</Label>
                <Input
                  id={`trainee-${index}-phone`}
                  value={trainee.contact_number || ''}
                  onChange={(e) => handleTraineeChange(index, 'contact_number', e.target.value)}
                  placeholder="Enter contact number"
                  required={isSelfSponsored}
                />
              </div>
              <div>
                <Label htmlFor={`trainee-${index}-email`}>Email *</Label>
                <Input
                  id={`trainee-${index}-email`}
                  type="email"
                  value={trainee.email || ''}
                  onChange={(e) => handleTraineeChange(index, 'email', e.target.value)}
                  placeholder="Enter email address"
                  required={isSelfSponsored}
                />
              </div>
            </div>
          </div>
        ))}
        
        {!isSelfSponsored && (
          <Button
            type="button"
            variant="outline"
            onClick={handleAddTrainee}
            className="w-full"
          >
            Add Another Trainee
          </Button>
        )}
      </div>
    </div>
  );
};

export default TraineeDetailsStep;
