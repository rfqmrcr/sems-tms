export interface Partner {
  id: string;
  name: string;
  partner_code: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  address: string;
  contact_person_1: string;
  contact_person_2?: string;
  email: string;
  contact_number_1: string;
  contact_number_2?: string;
  created_at: string;
  updated_at: string;
}