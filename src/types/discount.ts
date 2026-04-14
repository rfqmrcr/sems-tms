export interface PromoCode {
  id: string;
  code: string;
  type: 'fixed_amount' | 'percentage';
  percentage: number;
  valid_from: string;
  valid_until: string;
  usage_limit: number | null;
  usage_count: number;
  course_visibility_filter: 'public' | 'private' | 'both';
  sponsorship_type_filter: 'self' | 'corporate' | 'both';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  description: string | null;
}

export interface PartnerDiscount {
  id: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  public_course_discount: number;
  private_course_discount: number;
  created_at: string;
  updated_at: string;
}

export interface DiscountCalculation {
  originalAmount: number;
  partnerDiscount: number;
  promoDiscount: number;
  totalDiscount: number;
  finalAmount: number;
  discountBreakdown: {
    partnerDiscountAmount: number;
    promoDiscountAmount: number;
    totalDiscountAmount: number;
  };
}