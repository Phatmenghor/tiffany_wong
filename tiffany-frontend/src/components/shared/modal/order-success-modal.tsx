"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Check } from "lucide-react";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber?: string;
}

export function OrderSuccessModal({
  isOpen,
  onClose,
  orderNumber,
}: OrderSuccessModalProps) {
  // Auto-close after 5 seconds
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only">Order Success</DialogTitle>
      <DialogContent className="w-full sm:max-w-md max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden border-0 bg-white">
        {/* Success Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          {/* Success Icon Circle */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
            </div>
          </div>

          {/* Success Title */}
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Placed!</h2>

          {/* Success Message */}
          <p className="text-slate-600 mb-4">Your order has been successfully created.</p>

          {/* Order Number */}
          {orderNumber && (
            <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
              <p className="text-xs text-slate-600 mb-1">Order Number</p>
              <p className="text-lg font-mono font-bold text-slate-900">{orderNumber}</p>
            </div>
          )}

          {/* Info Text */}
          <p className="text-sm text-slate-500 mb-2">
            You'll be redirected to your orders page in a moment...
          </p>

          {/* Action Button */}
          <CustomButton
            onClick={onClose}
            className="w-full h-11 rounded-lg mt-6"
          >
            View My Orders
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
