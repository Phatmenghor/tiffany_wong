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
    <div className="fixed bottom-[2.6rem] left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-sm border-t px-[0.65rem] py-[0.4875rem]">
      <div className="flex items-center justify-between mb-[0.40625rem]">
        <div className="text-[11px]">
          <div className="text-muted-foreground font-medium">
            {totalItems} items • {totalQuantity} qty
          </div>
          {discountAmount > 0 && (
            <div className="text-red-600 font-semibold mt-[0.08125rem]">
              Save {formatCurrency(discountAmount)}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-[11px] text-muted-foreground">Total</div>
          <div className="text-[13px] font-bold text-primary">{formatCurrency(finalTotal)}</div>
        </div>
      </div>
      <CustomButton
        className="w-full gap-[0.325rem] h-[1.7875rem] rounded-[0.4875rem]"
        onClick={onCheckout}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-[0.65rem] w-[0.65rem] animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-[0.65rem] w-[0.65rem]" />
            Place Order
            <ArrowRight className="h-[0.65rem] w-[0.65rem] ml-auto" />
          </>
        )}
      </CustomButton>
    </div>
  );
}
