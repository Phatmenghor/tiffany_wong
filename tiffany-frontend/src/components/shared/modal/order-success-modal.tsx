"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Button } from "@/components/ui/button";
import { Check, ShoppingBag, Home, CreditCard, Package } from "lucide-react";
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
    <Dialog open={isOpen} onOpenChange={onBackToHome}>
      <DialogTitle className="sr-only">Order Placed Successfully</DialogTitle>
      <DialogContent className="w-full sm:max-w-md p-0 gap-0 flex flex-col overflow-hidden [&>button]:hidden">

        {/* Header */}
        <div className="flex flex-col items-center pt-8 pb-5 px-6 text-center border-b">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" />
            <div className="relative w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground">Order Placed!</h2>
          <p className="text-sm text-muted-foreground mt-1">Your order has been successfully created</p>
        </div>

        {/* Order details */}
        <div className="px-6 py-5 space-y-3">
          {/* Order number */}
          {orderNumber && (
            <div className="bg-muted/40 rounded-xl p-3.5 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">Order Number</p>
              <p className="text-base font-mono font-bold text-foreground">{orderNumber}</p>
            </div>
          )}

          {/* Detail rows */}
          <div className="space-y-2">
            {typeof itemCount === "number" && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Package className="h-3.5 w-3.5" />
                  Items
                </span>
                <span className="font-medium">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
              </div>
            )}
            {paymentMethod && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CreditCard className="h-3.5 w-3.5" />
                  Payment
                </span>
                <span className="font-medium">{paymentMethod}</span>
              </div>
            )}
            {typeof discountAmount === "number" && discountAmount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium text-red-500">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            {typeof totalAmount === "number" && (
              <div className="flex items-center justify-between text-sm border-t pt-2 mt-1">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-primary text-base">{formatCurrency(totalAmount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-1 flex flex-col gap-2.5">
          <CustomButton
            onClick={onViewOrders}
            className="w-full h-11 rounded-xl gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            View My Orders
          </CustomButton>
          <Button
            variant="outline"
            onClick={onBackToHome}
            className="w-full h-11 rounded-xl gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
