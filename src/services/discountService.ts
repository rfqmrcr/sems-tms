import { DiscountCalculation } from "@/types/discount";

export interface PromoCodeValidation {
  isValid: boolean;
  discountPercentage: number;
  errorMessage: string;
}

export const validatePromoCode = async (
  code: string,
  courseVisibility: string = 'public',
  sponsorshipType?: string
): Promise<PromoCodeValidation> => {
  return { isValid: false, discountPercentage: 0, errorMessage: 'Promo codes disabled in mock mode' };
};

export const getPartnerDiscount = async (organizationName: string, courseVisibility: string = 'public'): Promise<number> => {
  return 0;
};

export const calculateDiscounts = async (
  originalAmount: number,
  traineeCount: number,
  organizationName: string,
  courseVisibility: string = 'public',
  promoCode?: string,
  sponsorshipType?: string
): Promise<DiscountCalculation> => {
  const perTraineeAmount = originalAmount / traineeCount;
  const finalAmount = originalAmount;
  return {
    originalAmount,
    partnerDiscount: 0,
    promoDiscount: 0,
    totalDiscount: 0,
    finalAmount,
    discountBreakdown: { partnerDiscountAmount: 0, promoDiscountAmount: 0, totalDiscountAmount: 0 }
  };
};

export const incrementPromoCodeUsage = async (code: string): Promise<void> => {
  // Not implemented in mock mode
};