import { DiscountCalculation } from "@/types/discount";
import { delay } from '@/data/mockDatabase';

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
  await delay(100);
  return { isValid: false, discountPercentage: 0, errorMessage: 'Promo codes disabled in mock mode' };
};

export const getPartnerDiscount = async (organizationName: string, courseVisibility: string = 'public'): Promise<number> => {
  await delay(100);
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
  await delay(100);
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
  await delay(100);
};