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
    <div className="mb-[0.40625rem]">
      <h3 className="text-[0.4875rem] font-bold text-foreground">{children}</h3>
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
    <div className={cn("flex flex-col gap-[0.08125rem]", fullWidth && "col-span-2")}>
      <span className="text-[0.4875rem] font-semibold text-muted-foreground">{label}</span>
      <span className="text-[0.4875rem] text-foreground">{value || "-"}</span>
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
          <div className="flex items-center justify-center h-[10.4rem]">
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
          <div className="flex items-center justify-center h-[10.4rem] flex-col gap-[0.325rem]">
            <p className="text-[0.56875rem] font-medium text-muted-foreground">
              {detailError ? `Error: ${detailError}` : "No order data available"}
            </p>
            {detailError && (
              <p className="text-[0.4875rem] text-muted-foreground">
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
        <div className="px-[0.65rem] py-[0.4875rem] border-b bg-muted/30 flex-shrink-0 flex items-center justify-between gap-[0.4875rem]">
          <div className="flex items-center gap-[0.4875rem] min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-[0.325rem]">
                <p className="text-[0.56875rem] font-bold text-foreground font-mono truncate">
                  {orderData.orderNumber}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(orderData.orderNumber);
                  }}
                  className="p-[0.08125rem] rounded-[0.1625rem] hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy order number"
                >
                  <Copy className="h-[0.4875rem] w-[0.4875rem]" />
                </button>
              </div>
              <p className="text-[0.4875rem] text-muted-foreground mt-[0.08125rem]">Order Details</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-[0.4875rem] grid grid-cols-1 lg:grid-cols-3 gap-[0.4875rem]">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-[0.4875rem]">

              {/* Status Timeline */}
              <div className="rounded-[0.1625rem] border border-border/50 bg-card p-[0.4875rem]">
                <SectionTitle>Order Progress</SectionTitle>
                {isCancelled ? (
                  <div className="flex items-center gap-[0.325rem] px-[0.325rem] py-[0.325rem] rounded-[0.1625rem] bg-red-50 border border-red-200">
                    <XCircle className="h-[0.65rem] w-[0.65rem] text-red-500 flex-shrink-0" />
                    <span className="text-[0.4875rem] font-semibold text-red-700">
                      This order has been cancelled
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start overflow-x-auto px-[0.325rem] py-[0.325rem]">
                    {ORDER_STEPS.map((step, idx) => {
                      const isDone = currentStep >= STEP_ORDER[step];
                      const isCurrent = currentStep === STEP_ORDER[step];
                      return (
                        <div key={step} className="flex items-start flex-shrink-0">
                          <div className="flex flex-col items-center w-[3.9rem]">
                            <div
                              className={cn(
                                "w-[1.3rem] h-[1.3rem] rounded-full flex items-center justify-center text-[0.4875rem] font-semibold ring-2 ring-offset-1 transition-all",
                                isDone
                                  ? "bg-green-100 text-green-700 ring-green-200"
                                  : isCurrent
                                    ? "bg-primary text-primary-foreground ring-primary/40"
                                    : "bg-muted text-muted-foreground ring-muted",
                              )}
                            >
                              {isDone ? <Check className="h-[0.4875rem] w-[0.4875rem]" /> : idx + 1}
                            </div>
                            <span className="text-[0.4875rem] font-semibold text-foreground text-center mt-[0.24375rem] w-full">
                              {getOrderStatusLabel(step)}
                            </span>
                          </div>
                          {idx < ORDER_STEPS.length - 1 && (
                            <div
                              className={cn(
                                "flex-shrink-0 mt-[0.65rem] w-[1.3rem] h-[0.08125rem] transition-colors",
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
                <div className="rounded-[0.1625rem] border border-border/50 bg-card p-[0.4875rem]">
                  <SectionTitle>Order Items ({orderData.items.length})</SectionTitle>
                  <div className="space-y-[0.325rem]">
                    {orderData.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-[0.4875rem] p-[0.40625rem] rounded-[0.1625rem] border border-border/50 bg-muted/20"
                      >
                        {/* Image */}
                        <div className="relative flex-shrink-0 w-[2.6rem] h-[2.6rem] rounded-[0.24375rem] overflow-hidden bg-muted border border-border/50">
                          {item.productImageUrl ? (
                            <img
                              src={item.productImageUrl}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-[0.975rem] w-[0.975rem] text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-[0.1625rem] mb-[0.1625rem]">
                            <p className="text-[0.4875rem] font-semibold text-foreground leading-tight truncate">
                              {item.productName}
                            </p>
                            {item.hasActivePromotion && item.displayPromotionValue != null && (
                              <span className="flex-shrink-0 px-[0.24375rem] py-[0.08125rem] bg-red-100 text-red-700 rounded-[0.1625rem] text-[0.4875rem] font-bold leading-none">
                                {item.displayPromotionType === "PERCENTAGE"
                                  ? `${item.displayPromotionValue}% OFF`
                                  : `${formatCurrency(item.displayPromotionValue)} OFF`}
                              </span>
                            )}
                          </div>

                          {item.sizeName && (
                            <span className="text-[0.4875rem] text-muted-foreground bg-muted px-[0.24375rem] py-[0.08125rem] rounded-[0.1625rem] inline-block mb-[0.24375rem]">
                              {item.sizeName}
                            </span>
                          )}

                          <div className="flex items-center justify-between text-[0.4875rem] gap-[0.325rem]">
                            <div className="flex items-center gap-[0.24375rem] text-muted-foreground">
                              <span>{formatCurrency(item.displayPrice)}</span>
                              {item.hasActivePromotion && item.displayOriginPrice > item.displayPrice && (
                                <span className="line-through text-muted-foreground/50">
                                  {formatCurrency(item.displayOriginPrice)}
                                </span>
                              )}
                              <span className="inline-flex items-center px-[0.24375rem] py-[0.08125rem] rounded-[0.1625rem] bg-primary/10 text-primary font-bold text-[10px] leading-none">
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
              <div className="rounded-[0.1625rem] border border-border/50 bg-card p-[0.4875rem]">
                <SectionTitle>Pricing Summary</SectionTitle>
                <div className="space-y-[0.24375rem]">
                  <div className="flex justify-between text-[0.4875rem]">
                    <span className="text-muted-foreground">
                      Subtotal ({orderData.items?.length || 0} items)
                    </span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(orderData.subtotal || 0)}
                    </span>
                  </div>
                  {(orderData.discountAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-[0.4875rem]">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(orderData.discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="pt-[0.325rem] mt-[0.1625rem] border-t border-border/50 flex justify-between">
                    <span className="text-[0.4875rem] font-bold text-foreground">Total</span>
                    <span className="text-[0.56875rem] font-bold text-primary">
                      {formatCurrency(orderData.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-[0.4875rem]">

              {/* Order Info */}
              <div className="rounded-[0.1625rem] border border-border/50 bg-card p-[0.4875rem]">
                <SectionTitle>Order Info</SectionTitle>
                <div className="grid grid-cols-2 gap-x-[0.4875rem] gap-y-[0.325rem]">
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
              <div className="rounded-[0.1625rem] border border-border/50 bg-card p-[0.4875rem]">
                <SectionTitle>Customer</SectionTitle>
                <div className="space-y-[0.325rem]">
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
                <div className="rounded-[0.1625rem] border border-border/50 bg-card p-[0.4875rem]">
                  <SectionTitle>Customer Note</SectionTitle>
                  <p className="text-[0.4875rem] text-foreground leading-relaxed">
                    {orderData.customerNote}
                  </p>
                </div>
              )}

              {/* System Info */}
              <div className="rounded-[0.1625rem] border border-border/50 bg-card p-[0.4875rem]">
                <SectionTitle>System Info</SectionTitle>
                <div className="grid grid-cols-2 gap-x-[0.4875rem] gap-y-[0.325rem]">
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
          <div className="flex-shrink-0 px-[0.65rem] py-[0.4875rem] border-t bg-muted/20 flex items-center justify-end gap-[0.325rem]">
            <Button
              variant="default"
              size="sm"
              onClick={onUpdateOrder}
              className="gap-[0.24375rem] h-[1.3rem]"
            >
              <Edit className="h-[0.4875rem] w-[0.4875rem]" />
              Update Status
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
