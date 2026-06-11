import { CreditCard, Loader2 } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { formatCurrency } from "@/utils/common/currency-format";

interface OrderSummaryProps {
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
  paymentMethod: "CASH" | "BANK";
  onPaymentMethodChange: (method: "CASH" | "BANK") => void;
  onCheckout: () => void;
  isProcessing: boolean;
  selectedAddressId?: string;
}

export function OrderSummary({
  totalItems,
  totalQuantity,
  subtotal,
  discountAmount,
  finalTotal,
  paymentMethod,
  onPaymentMethodChange,
  onCheckout,
  isProcessing,
  selectedAddressId,
}: OrderSummaryProps) {
  return (
    <div className="hidden lg:block lg:col-span-1">
      <div className="bg-card border rounded-[0.65rem] p-[0.8125rem] sticky top-[3.9rem]">
        <h2 className="text-[0.73125rem] font-bold mb-[0.65rem] flex items-center justify-between">
          <span>Order Summary</span>
          <span className="text-[0.4875rem] font-normal text-muted-foreground bg-muted px-[0.325rem] py-[0.1625rem] rounded-[0.325rem]">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </span>
        </h2>

        <div className="space-y-[0.4875rem] mb-[0.8125rem]">
          {/* Items count with quantity */}
          <div className="bg-muted/50 rounded-[0.325rem] p-[0.4875rem] mb-[0.65rem]">
            <div className="text-[0.4875rem] text-muted-foreground mb-[0.325rem]">Items Breakdown</div>
            <div className="flex justify-between items-center">
              <span className="text-[0.56875rem] font-medium">
                {totalItems} unique {totalItems === 1 ? "product" : "products"}
              </span>
              <span className="text-[0.73125rem] font-bold text-foreground">{totalQuantity}</span>
            </div>
            <div className="text-[0.4875rem] text-muted-foreground mt-[0.1625rem]">total quantity</div>
          </div>

          {/* Subtotal */}
          <div className="flex justify-between text-[0.56875rem]">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          {/* Discount */}
          {discountAmount > 0 && (
            <div className="flex justify-between text-[0.56875rem] bg-red-50/30 p-[0.40625rem] rounded-[0.325rem] border border-red-200/50">
              <span className="text-red-700 font-medium">Discount Applied</span>
              <span className="font-bold text-red-600">
                -{formatCurrency(discountAmount)}
              </span>
            </div>
          )}

          {/* Shipping */}
          <div className="flex justify-between text-[0.56875rem] pt-[0.325rem] border-t">
            <span className="text-muted-foreground">Shipping & Fees</span>
            <span className="text-muted-foreground text-[0.4875rem]">Free</span>
          </div>

          {/* Total */}
          <div className="bg-primary/10 rounded-[0.325rem] p-[0.4875rem] border border-primary/20">
            <div className="flex justify-between items-center mb-[0.325rem]">
              <span className="font-bold text-foreground">Total Amount</span>
              <span className="text-[0.975rem] font-bold text-primary">{formatCurrency(finalTotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="text-[0.4875rem] text-red-600 text-right pt-[0.325rem] border-t border-primary/10">
                💰 You save <span className="font-bold">{formatCurrency(discountAmount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Method - In Row */}
        <div className="mb-[0.8125rem] p-[0.65rem] bg-muted/30 rounded-[0.4875rem] border">
          <h3 className="text-[0.56875rem] font-bold mb-[0.4875rem] flex items-center gap-[0.325rem]">
            <CreditCard className="h-[0.65rem] w-[0.65rem]" />
            Payment Method
          </h3>
          <div className="flex gap-[0.325rem]">
            <label className="flex-1 flex items-center gap-[0.325rem] cursor-pointer p-[0.40625rem] border rounded-[0.325rem] hover:bg-muted/50 transition-colors" onClick={() => onPaymentMethodChange("CASH")}>
              <input
                type="radio"
                name="paymentMethod"
                value="CASH"
                checked={paymentMethod === "CASH"}
                onChange={() => onPaymentMethodChange("CASH")}
                className="w-[0.65rem] h-[0.65rem]"
              />
              <span className="text-[0.56875rem] font-medium">Cash</span>
            </label>
            <label className="flex-1 flex items-center gap-[0.325rem] cursor-pointer p-[0.40625rem] border rounded-[0.325rem] hover:bg-muted/50 transition-colors" onClick={() => onPaymentMethodChange("BANK")}>
              <input
                type="radio"
                name="paymentMethod"
                value="BANK"
                checked={paymentMethod === "BANK"}
                onChange={() => onPaymentMethodChange("BANK")}
                className="w-[0.65rem] h-[0.65rem]"
              />
              <span className="text-[0.56875rem] font-medium">Bank</span>
            </label>
          </div>
        </div>
        <CustomButton
          className="w-full mb-[0.40625rem] gap-[0.325rem] h-[1.7875rem] rounded-[0.4875rem]"
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
            </>
          )}
        </CustomButton>
      </div>
    </div>
  );
}
