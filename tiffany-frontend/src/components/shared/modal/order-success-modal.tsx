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
      <DialogContent className="w-full sm:max-w-sm p-0 gap-0 overflow-hidden [&>button]:hidden">

        {/* Success banner */}
        <div className="bg-gradient-to-b from-green-500 to-green-600 px-6 pt-8 pb-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 ring-4 ring-white/30">
            <CheckCircle2 className="w-9 h-9 text-white" strokeWidth={2} />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Order Placed!</h2>
          <p className="text-green-100 text-sm mt-1">Your order has been confirmed</p>
        </div>

        {/* Card pulled up over the banner */}
        <div className="bg-background rounded-t-2xl -mt-4 px-5 pt-5 pb-5 space-y-4">

          {/* Order number */}
          {orderNumber && (
            <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
              <Receipt className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Order Number</p>
                <p className="text-sm font-mono font-bold text-foreground truncate">{orderNumber}</p>
              </div>
            </div>
          )}

          {/* Detail rows */}
          <div className="divide-y divide-border rounded-xl border overflow-hidden">
            {typeof itemCount === "number" && (
              <div className="flex items-center justify-between px-4 py-3 bg-card">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="w-3.5 h-3.5" />
                  Items
                </span>
                <span className="text-sm font-semibold">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>
            )}
            {paymentMethod && (
              <div className="flex items-center justify-between px-4 py-3 bg-card">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="w-3.5 h-3.5" />
                  Payment
                </span>
                <span className="text-sm font-semibold">{paymentMethod}</span>
              </div>
            )}
            {typeof discountAmount === "number" && discountAmount > 0 && (
              <div className="flex items-center justify-between px-4 py-3 bg-card">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="w-3.5 h-3.5" />
                  Discount
                </span>
                <span className="text-sm font-semibold text-red-500">
                  -{formatCurrency(discountAmount)}
                </span>
              </div>
            )}
            {typeof totalAmount === "number" && (
              <div className="flex items-center justify-between px-4 py-3.5 bg-green-50 dark:bg-green-950/20">
                <span className="text-sm font-bold text-foreground">Total Paid</span>
                <span className="text-base font-bold text-green-600">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5 pt-1">
            <button
              onClick={onViewOrders}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              View My Orders
            </button>
            <button
              onClick={onBackToHome}
              className="w-full h-11 rounded-xl border border-border text-sm font-semibold flex items-center justify-center gap-2 hover:bg-muted/60 transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
