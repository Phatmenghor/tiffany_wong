import { CreditCard, Loader2 } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { formatCurrency } from "@/utils/common/currency-format";
import { cn } from "@/lib/utils";
import { Card } from "@/components/shared/common/card";

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
      <Card className="sticky top-[3.9rem]">
        <h2 className="text-[13px] font-bold mb-[0.65rem] flex items-center justify-between">
          <span>Order Summary</span>
          <span className="text-[11px] font-normal text-muted-foreground bg-muted px-[0.325rem] py-[0.1625rem] rounded-[0.325rem]">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </span>
        </h2>

        <div className="space-y-[0.4875rem] mb-[0.8125rem]">
          {/* Items count with quantity */}
          <div className="bg-muted/50 rounded-[0.325rem] p-[0.4875rem] mb-[0.65rem]">
            <div className="text-[11px] text-muted-foreground mb-[0.325rem]">Items Breakdown</div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-medium">
                {totalItems} unique {totalItems === 1 ? "product" : "products"}
              </span>
              <span className="text-[13px] font-bold text-foreground">{totalQuantity}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-[0.1625rem]">total quantity</div>
          </div>

          {/* Subtotal */}
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          {/* Discount */}
          {discountAmount > 0 && (
            <div className="flex justify-between text-[11px] bg-red-50/30 p-[0.40625rem] rounded-[0.325rem] border border-red-200/50">
              <span className="text-red-700 font-medium">Discount Applied</span>
              <span className="font-bold text-red-600">
                -{formatCurrency(discountAmount)}
              </span>
            </div>
          )}

          {/* Shipping */}
          <div className="flex justify-between text-[11px] pt-[0.325rem] border-t">
            <span className="text-muted-foreground">Shipping & Fees</span>
            <span className="text-muted-foreground text-[11px]">Free</span>
          </div>

          {/* Total */}
          <div className="bg-primary/10 rounded-[0.325rem] p-[0.4875rem] border border-primary/20">
            <div className="flex justify-between items-center mb-[0.325rem]">
              <span className="font-bold text-foreground">Total Amount</span>
              <span className="text-[14px] font-bold text-primary">{formatCurrency(finalTotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="text-[11px] text-red-600 text-right pt-[0.325rem] border-t border-primary/10">
                💰 You save <span className="font-bold">{formatCurrency(discountAmount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-[0.8125rem] p-[0.65rem] bg-muted/30 rounded-[0.4875rem] border">
          <h3 className="text-[11px] font-bold mb-[0.4875rem]">Payment Method</h3>
          <div className="flex gap-[0.325rem]">
            {(["CASH", "BANK"] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => onPaymentMethodChange(method)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-[0.325rem] h-[2.5rem] sm:h-[1.625rem] border rounded-[0.325rem] text-[12px] sm:text-[11px] font-medium transition-colors",
                  paymentMethod === method
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted/50"
                )}
              >
                {method === "CASH" ? "💵" : "🏦"}
                {method === "CASH" ? "Cash" : "Bank"}
              </button>
            ))}
          </div>
        </div>
        <CustomButton
          className="w-full mb-[0.40625rem] gap-[0.325rem] h-[2.5rem] sm:h-[1.7875rem] rounded-[0.4875rem]"
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
      </Card>
    </div>
  );
}
