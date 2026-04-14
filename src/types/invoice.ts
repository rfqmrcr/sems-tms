
export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

// TaxSetting interface for tax configuration
export interface TaxSetting {
  name: string;
  rate: number;
}

// Organization interface to match what we get from Supabase
export interface Organization {
  id: string;
  name: string;
}

// Course interface to match what we get from Supabase
export interface Course {
  id: string;
  title: string;
  start_date?: string;
  end_date?: string;
}

// Course run interface
export interface CourseRun {
  title?: string;
  start_date?: string;
  end_date?: string;
  courses?: { id: string; title: string };
}

// Extended registration interface to match what we get from Supabase
export interface Registration {
  id: string;
  contact_person: string;
  contact_email: string;
  contact_number?: string;
  organization_id?: string;
  payment_status?: string;
  courses?: Course;
  course_runs?: CourseRun;
  hrdf_grant?: boolean;
  organization?: Organization;
}

export interface Invoice {
  id: string;
  registration_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  status: InvoiceStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  registration?: Registration;
}
