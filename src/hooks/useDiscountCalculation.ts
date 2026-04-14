import { useState, useEffect } from 'react';
import { calculateDiscounts } from '@/services/discountService';
import { DiscountCalculation } from '@/types/discount';

export const useDiscountCalculation = (
  originalAmount: number,
  traineeCount: number,
  organizationName: string,
  courseVisibility: string = 'public',
  sponsorshipType?: string
) => {
  const [discountCalculation, setDiscountCalculation] = useState<DiscountCalculation | null>(null);
  const [promoCode, setPromoCode] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const recalculateDiscounts = async (newPromoCode?: string) => {
    if (originalAmount <= 0 || traineeCount <= 0) {
      setDiscountCalculation(null);
      return;
    }

    setLoading(true);
    try {
      const calculation = await calculateDiscounts(
        originalAmount,
        traineeCount,
        organizationName,
        courseVisibility,
        newPromoCode || promoCode,
        sponsorshipType
      );
      setDiscountCalculation(calculation);
    } catch (error) {
      console.error('Error calculating discounts:', error);
      setDiscountCalculation({
        originalAmount,
        partnerDiscount: 0,
        promoDiscount: 0,
        totalDiscount: 0,
        finalAmount: originalAmount,
        discountBreakdown: {
          partnerDiscountAmount: 0,
          promoDiscountAmount: 0,
          totalDiscountAmount: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePromoCodeChange = (newCode: string) => {
    setPromoCode(newCode);
    recalculateDiscounts(newCode);
  };

  useEffect(() => {
    recalculateDiscounts();
  }, [originalAmount, traineeCount, organizationName, courseVisibility, sponsorshipType]);

  return {
    discountCalculation,
    promoCode,
    loading,
    handlePromoCodeChange,
    recalculateDiscounts
  };
};