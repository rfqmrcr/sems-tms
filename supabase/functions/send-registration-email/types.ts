export interface RegistrationData {
  contactName: string;
  contactEmail: string;
  companyName: string;
  courseName: string;
  courseStartDate: string;
  courseEndDate?: string;
  participantCount: number;
  hrdfGrant: boolean;
  coursePrice?: number;
  totalAmount?: number;
  quotationNumber?: string;
  registrationId?: string;
  emailType?: 'confirmation' | 'reservation' | 'payment_failed' | 'abandoned_cart';
  paymentLink?: string;
}

export type CourseType = 'technical' | 'soft-skills' | 'compliance' | 'general';
