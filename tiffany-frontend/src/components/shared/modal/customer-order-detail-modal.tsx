"use client";

import { useEffect, useState } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch } from "@/redux/store";
import { fetchOrderDetailsService } from "@/redux/features/main/store/thunks/my-orders-thunks";
import { formatCurrency } from "@/utils/common/currency-format";
import { Loading } from "@/components/shared/common/loading";
import { OrderResponse } from "@/redux/features/main/store/models/response/order-response";
import { Check, Clock, AlertCircle, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerOrderDetailModalProps {
  orderId?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface OrderDetailState {
  order: OrderResponse | null;
  loading: boolean;
  error: string | null;
}

// Order status steps configuration
const ORDER_STATUS_STEPS = [
  { status: "PENDING", label: "Pending", description: "Order placed, awaiting confirmation" },
  { status: "CONFIRMED", label: "Confirmed", description: "Order confirmed" },
  { status: "COMPLETED", label: "Completed", description: "Order delivered/completed" },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return <Check className="h-5 w-5" />;
    case "CONFIRMED":
      return <Package className="h-5 w-5" />;
    case "PENDING":
      return <Clock className="h-5 w-5" />;
    case "CANCELLED":
      return <AlertCircle className="h-5 w-5" />;
    default:
      return <Clock className="h-5 w-5" />;
  }
};

const getStatusColor = (status: string, isActive: boolean) => {
  if (!isActive) {
    return "bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600";
  }
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300";
    case "CONFIRMED":
      return "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300";
    case "PENDING":
      return "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300";
    default:
      return "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300";
  }
};

export function CustomerOrderDetailModal({
  orderId,
  isOpen,
  onClose,
}: CustomerOrderDetailModalProps) {
  const dispatch = useAppDispatch();
  const [state, setState] = useState<OrderDetailState>({
    order: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!orderId || !isOpen) return;

    const fetchOrderDetails = async () => {
      try {
        setState({ order: null, loading: true, error: null });
        const result = await dispatch(fetchOrderDetailsService(orderId)).unwrap();
        setState({ order: result, loading: false, error: null });
      } catch (error: any) {
        setState({
          order: null,
          loading: false,
          error: error?.message || "Failed to load order details",
        });
      }
    };

    fetchOrderDetails();
  }, [orderId, isOpen, dispatch]);

  const handleClose = () => {
    setState({ order: null, loading: false, error: null });
    onClose();
  };

  if (state.loading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">Order Details Loading</DialogTitle>
        <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <Loading />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!state.order) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">Order Details</DialogTitle>
        <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground">
                {state.error ? `Error: ${state.error}` : "No order data available"}
              </p>
              {state.error && (
                <p className="text-xs text-muted-foreground mt-2">
                  The order may have been deleted or you may not have permission to view it.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const orderData = state.order;
  const isCancelled = orderData.orderStatus === "CANCELLED";
  const currentStepIndex = ORDER_STATUS_STEPS.findIndex(
    (step) => step.status === orderData.orderStatus
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">Order Details - {orderData.orderNumber}</DialogTitle>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header with Order Number */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-primary/5 to-primary/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Order Details</h2>
              <p className="text-sm text-muted-foreground mt-1 font-mono font-semibold">
                {orderData.orderNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Order Date</p>
              <p className="text-sm font-semibold">{dateTimeFormat(orderData.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Order Status Timeline */}
            {!isCancelled ? (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold">📍 Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-start gap-4">
                    {ORDER_STATUS_STEPS.map((step, index) => {
                      const isCompleted = index < currentStepIndex;
                      const isActive = step.status === orderData.orderStatus;

                      return (
                        <div key={step.status} className="flex-1">
                          <div className="flex flex-col items-center">
                            <div className="relative w-full flex justify-center mb-3">
                              <div
                                className={cn(
                                  "w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all",
                                  isCompleted
                                    ? "bg-green-100 dark:bg-green-950 border-green-400 text-green-700 dark:text-green-300"
                                    : isActive
                                    ? `${getStatusColor(step.status, true)} border-current`
                                    : "bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-400"
                                )}
                              >
                                {isCompleted ? (
                                  <Check className="h-6 w-6" />
                                ) : (
                                  getStatusIcon(step.status)
                                )}
                              </div>

                              {/* Connecting Line */}
                              {index < ORDER_STATUS_STEPS.length - 1 && (
                                <div
                                  className={cn(
                                    "absolute top-7 left-1/2 h-1",
                                    isCompleted || isActive
                                      ? "bg-green-400 dark:bg-green-600"
                                      : "bg-gray-200 dark:bg-gray-700"
                                  )}
                                  style={{
                                    width: "100%",
                                    marginLeft: "50%",
                                  }}
                                />
                              )}
                            </div>

                            {/* Step Label */}
                            <div className="text-center">
                              <p
                                className={cn(
                                  "text-sm font-bold transition-colors",
                                  isCompleted || isActive
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                )}
                              >
                                {step.label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 max-w-[120px]">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Cancelled State */
              <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-700 dark:text-red-300">Order Cancelled</h3>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      This order has been cancelled
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Information Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Customer Information */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">👤 Customer Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-semibold text-right">{orderData.customerName || "---"}</span>
                  </div>
                  {orderData.customerPhone && (
                    <div className="flex justify-between items-start">
                      <span className="text-muted-foreground">Phone</span>
                      <a
                        href={`tel:${orderData.customerPhone}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        {orderData.customerPhone}
                      </a>
                    </div>
                  )}
                  {orderData.customerEmail && (
                    <div className="flex justify-between items-start">
                      <span className="text-muted-foreground">Email</span>
                      <a
                        href={`mailto:${orderData.customerEmail}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium break-all text-right max-w-xs"
                      >
                        {orderData.customerEmail}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">💳 Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Method</span>
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full font-semibold text-xs",
                        orderData.paymentMethod === "CASH"
                          ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
                          : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                      )}
                    >
                      {orderData.paymentMethod || "---"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full font-semibold text-xs",
                        orderData.paymentStatus === "PAID"
                          ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
                          : orderData.paymentStatus === "PENDING"
                          ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300"
                          : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                      )}
                    >
                      {orderData.paymentStatus || "---"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price Summary */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">💰 Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{orderData.items?.length || 0} Items</span>
                    <span className="font-semibold">{formatCurrency(orderData.subtotal || 0)}</span>
                  </div>
                  {(orderData.discountAmount ?? 0) > 0 && (
                    <div className="flex justify-between items-center text-red-600 dark:text-red-400">
                      <span>Discount</span>
                      <span className="font-semibold">-{formatCurrency(orderData.discountAmount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="font-bold">Total Amount</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(orderData.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            {orderData.items && orderData.items.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">
                    🛒 Order Items ({orderData.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {orderData.items.map((item) => (
                    <div
                      key={item.id}
                      className="border border-border/50 rounded-xl p-4 hover:shadow-md transition-all bg-card/50"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        {item.productImageUrl && (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
                            <img
                              src={item.productImageUrl}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Product Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          {/* Name and Badge */}
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-sm line-clamp-1">
                              {item.productName}
                            </h4>
                            {item.hasActivePromotion && item.displayPromotionValue != null && (
                              <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded font-semibold flex-shrink-0 whitespace-nowrap">
                                {item.displayPromotionType === "PERCENTAGE"
                                  ? `-${item.displayPromotionValue}%`
                                  : `-${formatCurrency(item.displayPromotionValue)}`}
                              </span>
                            )}
                          </div>

                          {/* Size */}
                          {item.sizeName && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full whitespace-nowrap inline-block border border-primary/20">
                                {item.sizeName}
                              </span>
                            </div>
                          )}

                          {/* Pricing */}
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-sm text-foreground">
                                {formatCurrency(item.displayPrice)} × {item.quantity}
                              </span>
                              {item.hasActivePromotion && item.displayOriginPrice > item.displayPrice && (
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatCurrency(item.displayOriginPrice)}
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-green-600 dark:text-green-400 text-sm">
                              {formatCurrency(item.subtotalAfterDiscount || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Customer Note */}
            {orderData.customerNote && (
              <Card className="border-0 shadow-sm bg-blue-50 dark:bg-blue-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">📝 Customer Note</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground">{orderData.customerNote}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
