
import { CourseRun, Organization, Registration, Trainee } from '@/services/courseService';
import { DiscountCalculation } from '@/types/discount';

export interface RegistrationSummaryProps {
  selectedCourse: CourseRun | null;
  organization: Organization;
  contact: Registration;
  trainees: Trainee[];
  calculateTotal: () => number;
  getFinalAmount?: () => number;
  getFinalAmountWithTax?: () => number;
  sponsorshipType?: 'corporate' | 'self' | null;
  discountCalculation?: DiscountCalculation | null;
  onPromoCodeChange?: (code: string) => void;
}
