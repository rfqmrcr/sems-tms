
import { CourseRun, Organization, Registration, Trainee } from '@/services/courseService';
import { addDays, isAfter, format } from 'date-fns';

export const useRegistrationValidation = () => {
  // MyKad validation function
  const validateMyKad = (value: string): boolean => {
    const myKadPattern = /^\d{6}-\d{2}-\d{4}$/;
    return myKadPattern.test(value);
  };

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const canProceed = (
    currentStepIndex: number,
    selectedCourse: CourseRun | null,
    organization: Organization,
    contact: Registration,
    trainees: Trainee[]
  ): boolean => {
    const isSelfSponsored = organization.name === 'Self Sponsored';
    const isCorporateWithHRDF = organization.name !== 'Self Sponsored' && contact.hrdf_grant;
    
    switch (currentStepIndex) {
      case 0: // course selection
        return selectedCourse !== null;
      case 1: // organization (only for corporate)
        const hasOrgFields = Boolean(organization.name && organization.contact_person && organization.contact_email);
        const hasValidOrgEmail = organization.contact_email ? validateEmail(organization.contact_email) : false;
        return hasOrgFields && hasValidOrgEmail;
      case 2: // contact (only for corporate)
        const hasRequiredContactFields = Boolean(contact.contact_person && contact.contact_email);
        const hasValidEmail = contact.contact_email ? validateEmail(contact.contact_email) : false;
        return hasRequiredContactFields && hasValidEmail;
      case 3: // trainees
        if (isSelfSponsored) {
          // For self-sponsored, require name, email, and phone
          const hasBasicFields = Boolean(
            trainees.length > 0 && 
            trainees[0].full_name.trim() !== '' &&
            trainees[0].email?.trim() !== '' &&
            trainees[0].contact_number?.trim() !== ''
          );
          
          // Validate email format for self-sponsored
          const hasValidTraineeEmail = trainees[0].email ? validateEmail(trainees[0].email) : false;
          return hasBasicFields && hasValidTraineeEmail;
        }
        
        // For corporate, check basic requirements
        const hasBasicRequirements = Boolean(
          trainees.length > 0 && 
          trainees.every(t => t.full_name.trim() !== '')
        );
        
        // Additional validation for corporate with HRDF
        if (isCorporateWithHRDF) {
          const hasValidMyKad = trainees.every(t => 
            t.nric && t.nric.trim() !== '' && validateMyKad(t.nric.trim())
          );
          return hasBasicRequirements && hasValidMyKad;
        }
        
        return hasBasicRequirements;
      case 4: // review
        return true;
      default:
        return false;
    }
  };

  const checkPaymentDueDateConflict = (
    selectedCourse: CourseRun | null,
    contact: Registration & { payment_terms?: string },
    organization: Organization
  ): { hasConflict: boolean; suggestedDate?: string } => {
    // Only check for immediate payments for non-HRDF registrations and individuals
    if (!selectedCourse || 
        contact.hrdf_grant === true || 
        !contact.payment_terms ||
        contact.payment_terms !== 'immediate') {
      return { hasConflict: false };
    }

    const courseStartDate = new Date(selectedCourse.start_date);
    const today = new Date();
    
    // Calculate due date based on payment terms (only for immediate payments)
    let dueDays = 0; // immediate payment
    if (contact.payment_terms === 'immediate') {
      dueDays = 0;
    }
    
    const paymentDueDate = addDays(today, dueDays);
    
    // Check if course starts before payment is due
    if (!isAfter(courseStartDate, paymentDueDate)) {
      // Suggest a new date that's 7 days after the payment due date
      const suggestedDate = format(addDays(paymentDueDate, 7), 'yyyy-MM-dd');
      return { hasConflict: true, suggestedDate };
    }
    
    return { hasConflict: false };
  };

  return { canProceed, checkPaymentDueDateConflict, validateEmail };
};
