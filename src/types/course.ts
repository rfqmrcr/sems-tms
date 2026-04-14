
export interface Course {
  id: string;
  title: string;
  description?: string;
  price?: number;
  registration_url?: string;
  hrdc_program_code?: string;
  category?: string;
  created_at: string;
}

export interface CourseRunSchedule {
  id: string;
  course_run_id: string;
  schedule_date: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

export interface CourseRun {
  id: string;
  course_id?: string;
  title?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  capacity?: number;
  price?: number;
  registration_url?: string;
  visibility?: string;
  created_at: string;
  course?: Course;
  remainingCapacity?: number;
  priceDisplay?: string;
  schedules?: CourseRunSchedule[];
}

export interface Organization {
  name: string;
  address: string;
  contact_person: string;
  contact_email: string;
  contact_number: string;
}

export interface Registration {
  contact_person: string;
  contact_email: string;
  contact_number: string;
  course_id: string;
  course_run_id: string;
  payment_amount?: number;
  hrdf_grant?: boolean;
  payment_terms?: string;
  // Discount fields
  promo_code_used?: string;
  partner_discount_percentage?: number;
  promo_discount_percentage?: number;
  total_discount_percentage?: number;
  original_amount?: number;
  discount_amount?: number;
}

export interface Trainee {
  full_name: string;
  nric?: string;
  dob?: string;
  gender?: string;
  contact_number?: string;
  email?: string;
}
