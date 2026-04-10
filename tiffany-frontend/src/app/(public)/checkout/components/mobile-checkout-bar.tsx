import { CreditCard, ArrowRight, Loader2 } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { formatCurrency } from "@/utils/common/currency-format";

interface MobileCheckoutBarProps {
  totalItems: number;
  totalQuantity: number;
  discountAmount: number;
  finalTotal: number;
  onCheckout: () => void;
  isProcessing: boolean;
  selectedAddressId?: string;
}

export function MobileCheckoutBar({
  totalItems,
  totalQuantity,
  discountAmount,
  finalTotal,
  onCheckout,
  isProcessing,
  selectedAddressId,
}: MobileCheckoutBarProps) {
  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-sm border-t px-4 py-3">
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-xs">
          <div className="text-muted-foreground font-medium">
            {totalItems} items • {totalQuantity} qty
          </div>
          {discountAmount > 0 && (
            <div className="text-red-600 font-semibold mt-0.5">
              Save {formatCurrency(discountAmount)}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-xl font-bold text-primary">{formatCurrency(finalTotal)}</div>
        </div>
      </div>
      <CustomButton
        className="w-full gap-2 h-11 rounded-xl"
        onClick={onCheckout}
        disabled={isProcessing || !selectedAddressId}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            Place Order
            <ArrowRight className="h-4 w-4 ml-auto" />
          </>
        )}
      </CustomButton>
    </div>
  );
}
