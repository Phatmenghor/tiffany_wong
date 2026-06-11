"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import {
  selectOrderAdminIsFetchingDetail,
  selectSelectedOrder,
  selectOrderAdminDetailError,
} from "../store/selectors/order-admin-selector";
import { fetchOrderByIdAdminService } from "../store/thunks/order-admin-thunks";
import { clearSelectedOrder } from "../store/slice/order-admin-slice";
import { formatCurrency } from "@/utils/common/currency-format";
import { getOrderStatusLabel } from "@/enums/order-status.enum";
import { Loading } from "@/components/shared/common/loading";
import { showToast } from "@/components/shared/common/show-toast";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Copy,
  Package,
  Check,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/enums/order-status.enum";

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

interface OrderDetailModalProps {
  orderId?: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdateOrder?: () => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5">
      <h3 className="text-xs font-bold text-foreground">{children}</h3>
    </div>
  );
}

function InfoRow({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", fullWidth && "col-span-2")}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span className="text-xs text-foreground">{value || "-"}</span>
    </div>
  );
}

export function OrderDetailModal({
  orderId,
  isOpen,
  onClose,
  onUpdateOrder,
}: OrderDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectOrderAdminIsFetchingDetail);
  const orderData = useAppSelector(selectSelectedOrder);
  const detailError = useAppSelector(selectOrderAdminDetailError);

  useEffect(() => {
    if (!orderId || !isOpen) return;
    dispatch(fetchOrderByIdAdminService(orderId));
  }, [orderId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedOrder());
    onClose();
  };

  if (isFetchingDetail) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">Order Details Loading</DialogTitle>
        <DialogContent className="w-full sm:max-w-6xl max-h-[95vh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-64">
            <Loading />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!orderData) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">Order Details</DialogTitle>
        <DialogContent className="w-full sm:max-w-6xl max-h-[95vh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-64 flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              {detailError ? `Error: ${detailError}` : "No order data available"}
            </p>
            {detailError && (
              <p className="text-xs text-muted-foreground">
                The order may have been deleted or you may not have permission.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const currentStep = STEP_ORDER[orderData.orderStatus] ?? -1;
  const isCancelled = orderData.orderStatus === "CANCELLED";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">Order Details - {orderData.orderNumber}</DialogTitle>

      <DialogContent className="w-full sm:max-w-6xl max-h-[95vh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground font-mono truncate">
                  {orderData.orderNumber}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(orderData.orderNumber);
                  }}
                  className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy order number"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Order Details</p>
            </div>
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
              {orderData.items && orderData.items.length > 0 && (
                <div className="rounded border border-border/50 bg-card p-3">
                  <SectionTitle>Order Items ({orderData.items.length})</SectionTitle>
                  <div className="space-y-2">
                    {orderData.items.map((item) => (
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
                      Subtotal ({orderData.items?.length || 0} items)
                    </span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(orderData.subtotal || 0)}
                    </span>
                  </div>
                  {(orderData.discountAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(orderData.discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 mt-1 border-t border-border/50 flex justify-between">
                    <span className="text-xs font-bold text-foreground">Total</span>
                    <span className="text-sm font-bold text-primary">
                      {formatCurrency(orderData.totalAmount || 0)}
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
                  <InfoRow
                    label="Date"
                    value={new Date(orderData.createdAt).toLocaleDateString()}
                  />
                  <InfoRow
                    label="Time"
                    value={new Date(orderData.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  />
                  <InfoRow
                    label="Payment"
                    value={orderData.paymentMethod || "-"}
                  />
                  <InfoRow
                    label="Pay Status"
                    value={
                      <span
                        className={cn(
                          "font-semibold",
                          orderData.paymentStatus === "PAID"
                            ? "text-green-600"
                            : orderData.paymentStatus === "REFUNDED"
                              ? "text-red-600"
                              : "text-amber-600",
                        )}
                      >
                        {orderData.paymentStatus || "-"}
                      </span>
                    }
                  />
                </div>
              </div>

              {/* Customer Info */}
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>Customer</SectionTitle>
                <div className="space-y-2">
                  <InfoRow label="Name" value={orderData.customerName || "Walk-in Customer"} />
                  {orderData.customerPhone && (
                    <InfoRow label="Phone" value={orderData.customerPhone} />
                  )}
                  {orderData.customerEmail && (
                    <InfoRow label="Email" value={orderData.customerEmail} />
                  )}
                </div>
              </div>

              {/* Customer Note */}
              {orderData.customerNote && (
                <div className="rounded border border-border/50 bg-card p-3">
                  <SectionTitle>Customer Note</SectionTitle>
                  <p className="text-xs text-foreground leading-relaxed">
                    {orderData.customerNote}
                  </p>
                </div>
              )}

              {/* System Info */}
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>System Info</SectionTitle>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <InfoRow label="Created By" value={orderData.createdBy || "-"} />
                  <InfoRow label="Created At" value={dateTimeFormat(orderData.createdAt)} />
                  <InfoRow label="Updated By" value={orderData.updatedBy || "-"} />
                  <InfoRow label="Last Updated" value={dateTimeFormat(orderData.updatedAt)} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {onUpdateOrder && (
          <div className="flex-shrink-0 px-4 py-3 border-t bg-muted/20 flex items-center justify-end gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={onUpdateOrder}
              className="gap-1.5 h-8"
            >
              <Edit className="h-3 w-3" />
              Update Status
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
