"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/utils/common/currency-format";
import { OrderResponse } from "@/redux/features/main/store/models/response/order-response";
import { getOrderStatusLabel, OrderStatus } from "@/enums/order-status.enum";
import { Button } from "@/components/ui/button";
import { Package, Check, XCircle, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { showToast } from "@/components/shared/common/show-toast";

interface CustomerOrderDetailModalProps {
  order?: OrderResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

const ORDER_STEPS: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.COMPLETED,
];

const STEP_ORDER: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  COMPLETED: 2,
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5">
      <h3 className="text-xs font-bold text-foreground">{children}</h3>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span className="text-xs text-foreground">{value || "-"}</span>
    </div>
  );
}

export function CustomerOrderDetailModal({
  order,
  isOpen,
  onClose,
}: CustomerOrderDetailModalProps) {
  if (!order) return null;

  const currentStep = STEP_ORDER[order.orderStatus] ?? -1;
  const isCancelled = order.orderStatus === "CANCELLED";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only">Order Details - {order.orderNumber}</DialogTitle>

      <DialogContent className="w-full sm:max-w-6xl max-h-[95dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0 flex items-center gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground font-mono truncate">
                {order.orderNumber}
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(order.orderNumber)}
                className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Copy order number"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Order Details</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 grid grid-cols-1 lg:grid-cols-3 gap-3">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-3">

              {/* Status Timeline */}
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>Order Progress</SectionTitle>
                {isCancelled ? (
                  <div className="flex items-center gap-2 px-2 py-2 rounded bg-red-50 border border-red-200">
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-red-700">
                      This order has been cancelled
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start overflow-x-auto px-2 py-2">
                    {ORDER_STEPS.map((step, idx) => {
                      const isDone = currentStep >= STEP_ORDER[step];
                      const isCurrent = currentStep === STEP_ORDER[step];
                      return (
                        <div key={step} className="flex items-start flex-shrink-0">
                          <div className="flex flex-col items-center w-24">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ring-2 ring-offset-1 transition-all",
                                isDone
                                  ? "bg-green-100 text-green-700 ring-green-200"
                                  : isCurrent
                                    ? "bg-primary text-primary-foreground ring-primary/40"
                                    : "bg-muted text-muted-foreground ring-muted",
                              )}
                            >
                              {isDone ? <Check className="h-3 w-3" /> : idx + 1}
                            </div>
                            <span className="text-xs font-semibold text-foreground text-center mt-1.5 w-full">
                              {getOrderStatusLabel(step)}
                            </span>
                          </div>
                          {idx < ORDER_STEPS.length - 1 && (
                            <div
                              className={cn(
                                "flex-shrink-0 mt-4 w-8 h-0.5 transition-colors",
                                currentStep > STEP_ORDER[step] ? "bg-green-300" : "bg-muted",
                              )}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div className="rounded border border-border/50 bg-card p-3">
                  <SectionTitle>Order Items ({order.items.length})</SectionTitle>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 p-2.5 rounded border border-border/50 bg-muted/20"
                      >
                        {/* Image */}
                        <div className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted border border-border/50">
                          {item.productImageUrl ? (
                            <img
                              src={item.productImageUrl}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <p className="text-xs font-semibold text-foreground leading-tight truncate">
                              {item.productName}
                            </p>
                            {item.hasActivePromotion && item.displayPromotionValue != null && (
                              <span className="flex-shrink-0 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold leading-none">
                                {item.displayPromotionType === "PERCENTAGE"
                                  ? `${item.displayPromotionValue}% OFF`
                                  : `${formatCurrency(item.displayPromotionValue)} OFF`}
                              </span>
                            )}
                          </div>

                          {item.sizeName && (
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded inline-block mb-1.5">
                              {item.sizeName}
                            </span>
                          )}

                          <div className="flex items-center justify-between text-xs gap-2">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <span>{formatCurrency(item.displayPrice)}</span>
                              {item.hasActivePromotion && item.displayOriginPrice > item.displayPrice && (
                                <span className="line-through text-muted-foreground/50">
                                  {formatCurrency(item.displayOriginPrice)}
                                </span>
                              )}
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold text-[10px] leading-none">
                                ×{item.quantity}
                              </span>
                            </div>
                            <span className="font-bold text-foreground flex-shrink-0">
                              {formatCurrency(item.subtotalAfterDiscount || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Summary */}
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>Pricing Summary</SectionTitle>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Subtotal ({order.items?.length || 0} items)
                    </span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(order.subtotal || 0)}
                    </span>
                  </div>
                  {(order.discountAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(order.discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 mt-1 border-t border-border/50 flex justify-between">
                    <span className="text-xs font-bold text-foreground">Total</span>
                    <span className="text-sm font-bold text-primary">
                      {formatCurrency(order.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-3">

              {/* Order Info */}
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>Order Info</SectionTitle>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <InfoRow label="Date" value={dateTimeFormat(order.createdAt)} />
                  <InfoRow label="Payment" value={order.paymentMethod || "-"} />
                  <InfoRow
                    label="Pay Status"
                    value={
                      <span
                        className={cn(
                          "font-semibold",
                          order.paymentStatus === "PAID"
                            ? "text-green-600"
                            : order.paymentStatus === "REFUNDED"
                              ? "text-red-600"
                              : "text-amber-600",
                        )}
                      >
                        {order.paymentStatus || "-"}
                      </span>
                    }
                  />
                </div>
              </div>

              {/* Customer Info */}
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>Customer</SectionTitle>
                <div className="space-y-2">
                  <InfoRow label="Name" value={order.customerName || "-"} />
                  {order.customerPhone && (
                    <InfoRow label="Phone" value={order.customerPhone} />
                  )}
                  {order.customerEmail && (
                    <InfoRow label="Email" value={order.customerEmail} />
                  )}
                </div>
              </div>

              {/* Customer Note */}
              {order.customerNote && (
                <div className="rounded border border-border/50 bg-card p-3">
                  <SectionTitle>Note</SectionTitle>
                  <p className="text-xs text-foreground leading-relaxed">
                    {order.customerNote}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
