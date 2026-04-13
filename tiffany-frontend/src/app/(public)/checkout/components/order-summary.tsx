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
  customerName?: string;
  customerPhone?: string;
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
  customerName,
  customerPhone,
}: OrderSummaryProps) {
  return (
    <div className="hidden lg:block lg:col-span-1">
      <div className="bg-card border rounded-2xl p-5 sticky top-24">
        <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
          <span>Order Summary</span>
          <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-lg">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </span>
        </h2>

        {/* Customer Information - Display */}
        {(customerName || customerPhone) && (
          <div className="mb-5 p-4 bg-blue-50/50 rounded-xl border border-blue-200/50">
            <div className="text-xs font-medium text-muted-foreground mb-2">Delivery Information</div>
            {customerName && (
              <div className="text-sm font-medium text-foreground mb-1">
                {customerName}
              </div>
            )}
            {customerPhone && (
              <div className="text-xs text-muted-foreground">
                📱 {customerPhone}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3 mb-5">
          {/* Items count with quantity */}
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <div className="text-xs text-muted-foreground mb-2">Items Breakdown</div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {totalItems} unique {totalItems === 1 ? "product" : "products"}
              </span>
              <span className="text-lg font-bold text-foreground">{totalQuantity}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">total quantity</div>
          </div>

          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          {/* Discount */}
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm bg-red-50/30 p-2.5 rounded-lg border border-red-200/50">
              <span className="text-red-700 font-medium">Discount Applied</span>
              <span className="font-bold text-red-600">
                -{formatCurrency(discountAmount)}
              </span>
            </div>
          )}

          {/* Shipping */}
          <div className="flex justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground">Shipping & Fees</span>
            <span className="text-muted-foreground text-xs">Free</span>
          </div>

          {/* Total */}
          <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-foreground">Total Amount</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(finalTotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="text-xs text-red-600 text-right pt-2 border-t border-primary/10">
                💰 You save <span className="font-bold">{formatCurrency(discountAmount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Method - In Row */}
        <div className="mb-5 p-4 bg-muted/30 rounded-xl border">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Method
          </h3>
          <div className="flex gap-2">
            <label className="flex-1 flex items-center gap-2 cursor-pointer p-2.5 border rounded-lg hover:bg-muted/50 transition-colors" onClick={() => onPaymentMethodChange("CASH")}>
              <input
                type="radio"
                name="paymentMethod"
                value="CASH"
                checked={paymentMethod === "CASH"}
                onChange={() => onPaymentMethodChange("CASH")}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Cash</span>
            </label>
            <label className="flex-1 flex items-center gap-2 cursor-pointer p-2.5 border rounded-lg hover:bg-muted/50 transition-colors" onClick={() => onPaymentMethodChange("BANK")}>
              <input
                type="radio"
                name="paymentMethod"
                value="BANK"
                checked={paymentMethod === "BANK"}
                onChange={() => onPaymentMethodChange("BANK")}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Bank</span>
            </label>
          </div>
        </div>
        <CustomButton
          className="w-full mb-2.5 gap-2 h-11 rounded-xl"
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
            </>
          )}
        </CustomButton>
      </div>
    </div>
  );
}
