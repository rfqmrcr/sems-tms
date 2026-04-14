export type QuotationStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'converted';

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

// Extended registration interface to match what we get from Supabase
export interface Registration {
  id: string;
  contact_person: string;
  contact_email: string;
  contact_number?: string;
  organization_id?: string;
  payment_status?: string;
  courses?: Course;
  hrdf_grant?: boolean;
  organization?: Organization;
}

export interface Quotation {
  id: string;
  registration_id: string;
  quotation_number: string;
  issue_date: string;
  valid_until: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  status: QuotationStatus;
  notes?: string;
  converted_to_invoice_id?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  registration?: Registration;
}