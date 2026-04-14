
import React from 'react';
import CourseSelectionStep from './CourseSelectionStep';
import OrganizationDetailsStep from './OrganizationDetailsStep';
import ContactInformationStep from './ContactInformationStep';
import TraineeDetailsStep from './TraineeDetailsStep';
import RegistrationSummary from './RegistrationSummary';
import { CourseRun, Organization, Registration, Trainee } from '@/services/courseService';

interface RegistrationStepsProps {
  currentStepIndex: number;
  courses: CourseRun[];
  selectedCourse: CourseRun | null;
  onCourseSelect: (course: CourseRun) => void;
  organization: Organization;
  setOrganization: React.Dispatch<React.SetStateAction<Organization>>;
  contact: Registration;
  setContact: React.Dispatch<React.SetStateAction<Registration>>;
  trainees: Trainee[];
  setTrainees: React.Dispatch<React.SetStateAction<Trainee[]>>;
  handleAddTrainee: () => void;
  handleRemoveTrainee: (index: number) => void;
  handleTraineeChange: (index: number, field: keyof Trainee, value: string) => void;
  calculateTotal: () => number;
  getFinalAmount?: () => number;
  getFinalAmountWithTax?: () => number;
  sponsorshipType?: 'corporate' | 'self' | null;
  discountCalculation?: any;
  onPromoCodeChange?: (code: string) => void;
  onChangeCourse?: () => void;
}

const RegistrationSteps: React.FC<RegistrationStepsProps> = ({
  currentStepIndex,
  courses,
  selectedCourse,
  onCourseSelect,
  organization,
  setOrganization,
  contact,
  setContact,
  trainees,
  setTrainees,
  handleAddTrainee,
  handleRemoveTrainee,
  handleTraineeChange,
  calculateTotal,
  getFinalAmount,
  getFinalAmountWithTax,
  sponsorshipType,
  discountCalculation,
  onPromoCodeChange,
  onChangeCourse
}) => {
  // For corporate flow, skip Contact Information step (use organization details instead)
  const isCorporate = sponsorshipType === 'corporate';
  
  switch (currentStepIndex) {
    case 0:
      return (
        <CourseSelectionStep
          courses={courses}
          selectedCourse={selectedCourse}
          onCourseSelect={onCourseSelect}
          sponsorshipType={sponsorshipType}
          onChangeCourse={onChangeCourse}
        />
      );
    case 1:
      return (
        <OrganizationDetailsStep
          organization={organization}
          setOrganization={setOrganization}
        />
      );
    case 2:
      // For corporate: skip to Trainee Details
      // For self: show Contact Information
      if (isCorporate) {
        return (
          <TraineeDetailsStep
            trainees={trainees}
            handleAddTrainee={handleAddTrainee}
            handleRemoveTrainee={handleRemoveTrainee}
            handleTraineeChange={handleTraineeChange}
            sponsorshipType={sponsorshipType}
            contact={contact}
          />
        );
      } else {
        return (
          <ContactInformationStep
            contact={contact}
            setContact={setContact}
          />
        );
      }
    case 3:
      // For corporate: show Summary (step 4)
      // For self: show Trainee Details
      if (isCorporate) {
        return (
          <RegistrationSummary
            selectedCourse={selectedCourse}
            organization={organization}
            contact={contact}
            trainees={trainees}
            calculateTotal={calculateTotal}
            getFinalAmount={getFinalAmount}
            getFinalAmountWithTax={getFinalAmountWithTax}
            sponsorshipType={sponsorshipType}
            discountCalculation={discountCalculation}
            onPromoCodeChange={onPromoCodeChange}
          />
        );
      } else {
        return (
          <TraineeDetailsStep
            trainees={trainees}
            handleAddTrainee={handleAddTrainee}
            handleRemoveTrainee={handleRemoveTrainee}
            handleTraineeChange={handleTraineeChange}
            sponsorshipType={sponsorshipType}
            contact={contact}
          />
        );
      }
    case 4:
      // Only for self-sponsored flow
      return (
        <RegistrationSummary
          selectedCourse={selectedCourse}
          organization={organization}
          contact={contact}
          trainees={trainees}
          calculateTotal={calculateTotal}
          getFinalAmount={getFinalAmount}
          getFinalAmountWithTax={getFinalAmountWithTax}
          sponsorshipType={sponsorshipType}
          discountCalculation={discountCalculation}
          onPromoCodeChange={onPromoCodeChange}
        />
      );
    default:
      return null;
  }
};

export default RegistrationSteps;
