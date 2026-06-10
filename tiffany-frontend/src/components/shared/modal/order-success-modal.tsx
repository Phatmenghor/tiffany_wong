"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Button } from "@/components/ui/button";
import { Check, ShoppingBag, Home } from "lucide-react";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToHome?: () => void;
  orderNumber?: string;
}

export function OrderSuccessModal({
  isOpen,
  onClose,
  onBackToHome,
  orderNumber,
}: OrderSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only">Order Placed Successfully</DialogTitle>
      <DialogContent className="w-full sm:max-w-md p-0 gap-0 flex flex-col overflow-hidden border-0 bg-white [&>button]:hidden">
        <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
          {/* Success icon */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Placed!</h2>
          <p className="text-slate-500 text-sm mb-6">Your order has been successfully created.</p>

          {/* Order number */}
          {orderNumber && (
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
              <p className="text-xs text-slate-500 mb-1">Order Number</p>
              <p className="text-lg font-mono font-bold text-slate-900">{orderNumber}</p>
            </div>
          )}

          {/* Actions */}
          <div className="w-full flex flex-col gap-3">
            <CustomButton
              onClick={onClose}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
