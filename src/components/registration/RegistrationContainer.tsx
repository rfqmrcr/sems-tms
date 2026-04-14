import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import FormStepIndicator from '@/components/FormStepIndicator';
import RegistrationSteps from '@/components/registration/RegistrationSteps';
import RegistrationNavigation from '@/components/registration/RegistrationNavigation';
import SponsorshipTypeDialog from '@/components/registration/SponsorshipTypeDialog';
import PaymentTermsDialog from '@/components/registration/PaymentTermsDialog';
import PaymentDueDateDialog from '@/components/registration/PaymentDueDateDialog';
import { useMultiStepForm } from '@/hooks/useMultiStepForm';
import { useRegistrationValidation } from '@/hooks/useRegistrationValidation';
import { useRegistrationForm } from '@/hooks/useRegistrationForm';
import { Registration } from '@/services/courseService';
import { fetchAlternativeCourseRuns } from '@/services/courseService';
import { CourseRun } from '@/types/course';
import { toast } from 'sonner';

interface RegistrationContainerProps {
  preselectedCourseRun?: CourseRun;
}

const RegistrationContainer: React.FC<RegistrationContainerProps> = ({ preselectedCourseRun }) => {
  const [showSponsorshipDialog, setShowSponsorshipDialog] = useState(false);
  const [showPaymentTermsDialog, setShowPaymentTermsDialog] = useState(false);
  const [showPaymentDueDateDialog, setShowPaymentDueDateDialog] = useState(false);
  const [sponsorshipType, setSponsorshipType] = useState<'corporate' | 'self' | null>(null);
  const [suggestedCourseDate, setSuggestedCourseDate] = useState<string>('');

  const {
    courses,
    selectedCourse,
    organization,
    setOrganization,
    contact,
    setContact,
    trainees,
    setTrainees,
    handleCourseSelect,
    handleAddTrainee,
    handleRemoveTrainee,
    handleTraineeChange,
    calculateTotal,
    getFinalAmount,
    getFinalAmountWithTax,
    handleSubmit,
    submitting,
    discountCalculation,
    handlePromoCodeChange,
  } = useRegistrationForm(preselectedCourseRun, sponsorshipType);

  // Determine steps based on sponsorship type
  const getSteps = () => {
    if (sponsorshipType === 'self') {
      return ['Course Selection', 'Trainee Details', 'Review & Submit'];
    }
    return ['Course Selection', 'Organization Details', 'Contact Information', 'Trainee Details', 'Review & Submit'];
  };

  const getStepIndices = () => {
    if (sponsorshipType === 'self') {
      return [0, 1, 2]; // Skip organization and contact steps
    }
    return [0, 1, 2, 3, 4]; // All steps
  };

  const {
    currentStepIndex,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
  } = useMultiStepForm(getStepIndices());

  const { canProceed, checkPaymentDueDateConflict } = useRegistrationValidation();

  // Enhanced course selection handler
  const handleCourseSelectWithDialog = (course: any) => {
    console.log('Course selected:', course);
    handleCourseSelect(course);
    // Only show sponsorship dialog if a valid course is selected (not when resetting)
    if (course && course.id && course.course_id) {
      setShowSponsorshipDialog(true);
    }
  };

  // Handle sponsorship type selection
  const handleSponsorshipTypeSelect = (type: 'corporate' | 'self') => {
    console.log('Sponsorship type selected:', type);
    setSponsorshipType(type);
    setShowSponsorshipDialog(false);
    
    if (type === 'self') {
      // For self-sponsored, prefill organization with personal details
      setOrganization({
        name: 'Self Sponsored',
        address: '',
        contact_person: '',
        contact_email: '',
        contact_number: '',
      });
      
      // Add first trainee if none exists
      if (trainees.length === 0) {
        handleAddTrainee();
      }
    }
  };

  // Handle payment terms selection
  const handlePaymentTermsSelect = (terms: 'immediate' | '14_days' | '30_days') => {
    const updatedContact: Registration = {
      ...contact,
      payment_terms: terms
    };
    setContact(updatedContact);
    setShowPaymentTermsDialog(false);
    
    // Only check for payment due date conflict for immediate payments (exclude self-sponsored)
    const isSelfSponsored = organization.name === 'Self Sponsored';
    if (terms === 'immediate' && !isSelfSponsored) {
      const conflict = checkPaymentDueDateConflict(selectedCourse, updatedContact, organization);
      if (conflict.hasConflict && conflict.suggestedDate) {
        setSuggestedCourseDate(conflict.suggestedDate);
        setShowPaymentDueDateDialog(true);
      } else {
        nextStep();
      }
    } else {
      nextStep();
    }
  };

  // Handle suggested course date acceptance
  const handleAcceptSuggestedDate = async () => {
    if (!selectedCourse || !suggestedCourseDate) return;
    
    try {
      // Try to find an alternative course run with the suggested date or later
      const alternatives = await fetchAlternativeCourseRuns(selectedCourse.course_id || '', selectedCourse.id);
      const suitableAlternative = alternatives.find(alt => 
        new Date(alt.start_date) >= new Date(suggestedCourseDate)
      );
      
      if (suitableAlternative) {
        handleCourseSelect(suitableAlternative);
        toast.success('Course date updated to ensure payment completion before course start');
      } else {
        toast.info('No alternative course dates available. Please check course schedule or contact support.');
      }
    } catch (error) {
      console.error('Error fetching alternative courses:', error);
      toast.error('Unable to find alternative course dates');
    }
    
    setShowPaymentDueDateDialog(false);
    nextStep();
  };

  // Handle keeping original date
  const handleKeepOriginalDate = () => {
    setShowPaymentDueDateDialog(false);
    toast.warning('Please ensure payment is completed before the course start date');
    nextStep();
  };

  const handleChangeCourse = () => {
    handleCourseSelect({ id: '', course_id: '', start_date: '', end_date: '', capacity: 0, price: 0 } as CourseRun);
    setSponsorshipType(null);
    setShowSponsorshipDialog(false);
    setShowPaymentTermsDialog(false);
    setShowPaymentDueDateDialog(false);
  };

  // Enhanced navigation handler - removed payment terms dialog for corporate
  const handleNextStep = () => {
    // If we're on course selection step (step 0) and have a selected course but no sponsorship type yet
    if (getMappedStepIndex() === 0 && selectedCourse && !sponsorshipType) {
      setShowSponsorshipDialog(true);
      return;
    }
    
    // Corporate registrations proceed directly without payment terms dialog
    // Payment details will be sent via email with payment link
    nextStep();
  };

  // Map current step to actual step based on sponsorship type
  const getMappedStepIndex = () => {
    if (sponsorshipType === 'self') {
      // Map: 0->0 (course), 1->3 (trainee), 2->4 (summary)
      return currentStepIndex === 0 ? 0 : currentStepIndex === 1 ? 3 : 4;
    }
    return currentStepIndex;
  };

  const canProceedToNext = canProceed(getMappedStepIndex(), selectedCourse, organization, contact, trainees);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">Course Registration</h1>
      <p className="text-gray-600 text-center mb-8">
        Complete your registration in a few simple steps
      </p>

      <FormStepIndicator
        steps={getSteps()}
        currentStep={currentStepIndex}
      />

      <Card className="mt-8">
        <CardContent className="p-8">
          <RegistrationSteps
            currentStepIndex={getMappedStepIndex()}
            courses={courses}
            selectedCourse={selectedCourse}
            onCourseSelect={handleCourseSelectWithDialog}
            organization={organization}
            setOrganization={setOrganization}
            contact={contact}
            setContact={setContact}
            trainees={trainees}
            setTrainees={setTrainees}
            handleAddTrainee={handleAddTrainee}
            handleRemoveTrainee={handleRemoveTrainee}
            handleTraineeChange={handleTraineeChange}
            calculateTotal={calculateTotal}
            getFinalAmount={getFinalAmount}
            getFinalAmountWithTax={getFinalAmountWithTax}
            sponsorshipType={sponsorshipType}
            discountCalculation={discountCalculation}
            onPromoCodeChange={handlePromoCodeChange}
            onChangeCourse={handleChangeCourse}
          />

          <RegistrationNavigation
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            canProceed={canProceedToNext}
            submitting={submitting}
            onPrevious={prevStep}
            onNext={handleNextStep}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      <SponsorshipTypeDialog
        open={showSponsorshipDialog}
        onClose={() => setShowSponsorshipDialog(false)}
        onSelectSponsorshipType={handleSponsorshipTypeSelect}
      />

      <PaymentTermsDialog
        open={showPaymentTermsDialog}
        onClose={() => {
          setShowPaymentTermsDialog(false);
          nextStep(); // Continue to next step if dialog is cancelled
        }}
        onSelectPaymentTerms={handlePaymentTermsSelect}
      />

      <PaymentDueDateDialog
        open={showPaymentDueDateDialog}
        onClose={() => setShowPaymentDueDateDialog(false)}
        onAcceptSuggestedDate={handleAcceptSuggestedDate}
        onKeepOriginalDate={handleKeepOriginalDate}
        currentCourseDate={selectedCourse?.start_date || ''}
        suggestedDate={suggestedCourseDate}
        paymentTerms={(contact as any).payment_terms || '14_days'}
      />
    </div>
  );
};

export default RegistrationContainer;
