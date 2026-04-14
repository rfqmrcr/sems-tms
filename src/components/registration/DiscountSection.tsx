import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tag, Percent, Users } from "lucide-react";
import { validatePromoCode } from "@/services/discountService";
import { DiscountCalculation } from "@/types/discount";
import { useToast } from "@/hooks/use-toast";

interface DiscountSectionProps {
  discountCalculation: DiscountCalculation | null;
  onPromoCodeChange: (code: string) => void;
  courseVisibility: string;
  sponsorshipType?: string;
  loading?: boolean;
}

export const DiscountSection = ({
  discountCalculation,
  onPromoCodeChange,
  courseVisibility,
  sponsorshipType,
  loading = false
}: DiscountSectionProps) => {
  const [promoCode, setPromoCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validatedCode, setValidatedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;

    setIsValidating(true);
    try {
      const validation = await validatePromoCode(promoCode.trim(), courseVisibility, sponsorshipType);
      
      if (validation.isValid) {
        setValidatedCode(promoCode.trim());
        onPromoCodeChange(promoCode.trim());
        toast({
          title: "Promo code applied!",
          description: `${validation.discountPercentage}% discount will be applied.`,
        });
      } else {
        toast({
          title: "Invalid promo code",
          description: validation.errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate promo code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemovePromoCode = () => {
    setPromoCode("");
    setValidatedCode(null);
    onPromoCodeChange("");
  };

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toFixed(2)}`;
  };

  if (loading || !discountCalculation) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span>Calculating discounts...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasDiscounts = discountCalculation.partnerDiscount > 0 || discountCalculation.promoDiscount > 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Promo Code Input */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="font-medium">Promo Code</span>
            </div>
            
            {!validatedCode ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyPromoCode()}
                />
                <Button 
                  onClick={handleApplyPromoCode}
                  disabled={!promoCode.trim() || isValidating}
                  variant="outline"
                >
                  {isValidating ? "Checking..." : "Apply"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-md border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    {validatedCode}
                  </Badge>
                  <span className="text-sm text-green-700 dark:text-green-300">Applied</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePromoCode}
                  className="text-green-700 hover:text-green-800 dark:text-green-300 dark:hover:text-green-200"
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          {/* Discount Summary */}
          {hasDiscounts && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  <span className="font-medium">Active Discounts</span>
                </div>

                <div className="space-y-3">
                  {discountCalculation.partnerDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        <span>Partner Discount</span>
                        <Badge variant="outline" className="text-xs">
                          {discountCalculation.partnerDiscount}%
                        </Badge>
                      </div>
                      <span className="text-green-600 dark:text-green-400">
                        -{formatCurrency(discountCalculation.discountBreakdown.partnerDiscountAmount)}
                      </span>
                    </div>
                  )}

                  {discountCalculation.promoDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3 w-3" />
                        <span>Promo Code Discount</span>
                        <Badge variant="outline" className="text-xs">
                          {discountCalculation.promoDiscount}%
                        </Badge>
                      </div>
                      <span className="text-green-600 dark:text-green-400">
                        -{formatCurrency(discountCalculation.discountBreakdown.promoDiscountAmount)}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />
                
                {/* Price Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Original Amount:</span>
                    <span>{formatCurrency(discountCalculation.originalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Total Discount ({discountCalculation.totalDiscount}%):</span>
                    <span>-{formatCurrency(discountCalculation.discountBreakdown.totalDiscountAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                    <span>Final Amount:</span>
                    <span>{formatCurrency(discountCalculation.finalAmount)}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {!hasDiscounts && (
            <div className="text-center text-muted-foreground py-4">
              <p className="text-sm">No discounts applied</p>
              <p className="text-xs mt-1">Enter a promo code above to apply additional discounts</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};