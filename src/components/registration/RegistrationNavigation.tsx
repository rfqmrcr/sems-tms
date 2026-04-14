
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RegistrationNavigationProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  canProceed: boolean;
  submitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

const RegistrationNavigation: React.FC<RegistrationNavigationProps> = ({
  isFirstStep,
  isLastStep,
  canProceed,
  submitting,
  onPrevious,
  onNext,
  onSubmit
}) => {
  const navigate = useNavigate();

  const handlePrevious = () => {
    if (isFirstStep) {
      navigate('/registration');
    } else {
      onPrevious();
    }
  };

  return (
    <div className="flex justify-between mt-8">
      <Button
        type="button"
        variant="outline"
        onClick={handlePrevious}
        className="flex items-center"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      {isLastStep ? (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!canProceed || submitting}
          className="flex items-center"
        >
          {submitting ? 'Submitting...' : 'Submit Registration'}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="flex items-center"
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );
};

export default RegistrationNavigation;
