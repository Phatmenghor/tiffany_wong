"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, ShoppingBag, Home, Receipt, CreditCard, Package, Tag } from "lucide-react";
import { formatCurrency } from "@/utils/common/currency-format";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onViewOrders: () => void;
  onBackToHome: () => void;
  orderNumber?: string;
  totalAmount?: number;
  discountAmount?: number;
  itemCount?: number;
  paymentMethod?: string;
}

export function OrderSuccessModal({
  isOpen,
  onViewOrders,
  onBackToHome,
  orderNumber,
  totalAmount,
  discountAmount,
  itemCount,
  paymentMethod,
}: OrderSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogTitle className="sr-only">Order Placed Successfully</DialogTitle>
      <DialogContent className="w-full sm:max-w-xl p-0 gap-0 overflow-hidden [&>button]:hidden">

        {/* Success banner */}
        <div className="bg-gradient-to-b from-green-500 to-green-600 px-[1.3rem] pt-[1.625rem] pb-[1.95rem] flex flex-col items-center text-center">
          <div className="w-[3.25rem] h-[3.25rem] rounded-full bg-white/20 flex items-center justify-center mb-[0.8125rem] ring-4 ring-white/30">
            <CheckCircle2 className="w-[1.7875rem] h-[1.7875rem] text-white" strokeWidth={2} />
          </div>
          <h2 className="text-[0.975rem] font-bold text-white tracking-tight">Order Placed!</h2>
          <p className="text-green-100 text-[0.65rem] mt-[0.24375rem]">Your order has been confirmed</p>
        </div>

        {/* Card pulled up over the banner */}
        <div className="bg-background rounded-t-[0.65rem] -mt-[0.65rem] px-[0.975rem] pt-[0.975rem] pb-[0.975rem] space-y-[0.8125rem]">

          {/* Order number */}
          {orderNumber && (
            <div className="flex items-center gap-[0.4875rem] bg-muted/50 rounded-[0.4875rem] px-[0.8125rem] py-[0.65rem]">
              <Receipt className="w-[0.8125rem] h-[0.8125rem] text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[0.4875rem] uppercase tracking-widest text-muted-foreground font-medium">Order Number</p>
                <p className="text-[0.65rem] font-mono font-bold text-foreground truncate">{orderNumber}</p>
              </div>
            </div>
          )}

          {/* Detail rows */}
          <div className="divide-y divide-border rounded-[0.4875rem] border overflow-hidden">
            {typeof itemCount === "number" && (
              <div className="flex items-center justify-between px-[0.8125rem] py-[0.56875rem] bg-card">
                <span className="flex items-center gap-[0.325rem] text-[0.56875rem] text-muted-foreground">
                  <Package className="w-[0.65rem] h-[0.65rem]" />
                  Items
                </span>
                <span className="text-[0.56875rem] font-semibold">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>
            )}
            {paymentMethod && (
              <div className="flex items-center justify-between px-[0.8125rem] py-[0.56875rem] bg-card">
                <span className="flex items-center gap-[0.325rem] text-[0.56875rem] text-muted-foreground">
                  <CreditCard className="w-[0.65rem] h-[0.65rem]" />
                  Payment
                </span>
                <span className="text-[0.56875rem] font-semibold">{paymentMethod}</span>
              </div>
            )}
            {typeof discountAmount === "number" && discountAmount > 0 && (
              <div className="flex items-center justify-between px-[0.8125rem] py-[0.56875rem] bg-card">
                <span className="flex items-center gap-[0.325rem] text-[0.56875rem] text-muted-foreground">
                  <Tag className="w-[0.65rem] h-[0.65rem]" />
                  Discount
                </span>
                <span className="text-[0.56875rem] font-semibold text-red-500">
                  -{formatCurrency(discountAmount)}
                </span>
              </div>
            )}
            {typeof totalAmount === "number" && (
              <div className="flex items-center justify-between px-[0.8125rem] py-[0.65rem] bg-green-50 dark:bg-green-950/20">
                <span className="text-[0.65rem] font-bold text-foreground">Total Paid</span>
                <span className="text-[0.73125rem] font-bold text-green-600">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-[0.4875rem] pt-[0.1625rem]">
            <button
              onClick={onViewOrders}
              className="w-full h-[1.95rem] rounded-[0.4875rem] bg-primary text-primary-foreground text-[0.56875rem] font-semibold flex items-center justify-center gap-[0.325rem] hover:bg-primary/90 transition-colors"
            >
              <ShoppingBag className="w-[0.65rem] h-[0.65rem]" />
              View My Orders
            </button>
            <button
              onClick={onBackToHome}
              className="w-full h-[1.95rem] rounded-[0.4875rem] border border-border text-[0.56875rem] font-semibold flex items-center justify-center gap-[0.325rem] hover:bg-muted/60 transition-colors"
            >
              <Home className="w-[0.65rem] h-[0.65rem]" />
              Back to Home
            </button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
