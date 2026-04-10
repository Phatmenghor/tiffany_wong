"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
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
import { DisplayField } from "@/components/shared/form-field/display-field";
import { Clock, Package, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { showToast } from "@/components/shared/common/show-toast";

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

interface OrderDetailModalProps {
  orderId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailModal({
  orderId,
  isOpen,
  onClose,
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
        <DialogContent className="w-full sm:max-w-5xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
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
        <DialogContent className="w-full sm:max-w-5xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground">
                {detailError ? `Error: ${detailError}` : "No order data available"}
              </p>
              {detailError && (
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">Order Details - {orderData.orderNumber}</DialogTitle>
      <DialogContent className="w-full sm:max-w-5xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Order Details</h2>
            <p className="text-sm text-muted-foreground mt-1">{orderData.orderNumber}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Order Status Timeline - Modern Progress Bar */}
            {orderData.orderStatus !== "CANCELLED" ? (
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-8 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-10">Order Progress</h3>

                {/* Progress Steps with Full Width Connection Lines */}
                <div className="relative">
                  {/* Full Width Background Line */}
                  <div className="absolute top-7 left-0 right-0 h-1 bg-slate-300 rounded-full">
                    {/* Filled Progress Line */}
                    <div
                      className={cn(
                        "h-full bg-gradient-to-r from-primary via-primary to-primary rounded-full transition-all duration-500 shadow-sm shadow-primary/30",
                        ORDER_STATUS_STEPS.findIndex((s) => s.status === orderData.orderStatus) >
                          0 && "shadow-md shadow-primary/30"
                      )}
                      style={{
                        width: `${(ORDER_STATUS_STEPS.findIndex((s) => s.status === orderData.orderStatus) / (ORDER_STATUS_STEPS.length - 1)) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Steps Container */}
                  <div className="flex items-start justify-between">
                    {ORDER_STATUS_STEPS.map((step) => {
                      const stepIndex = ORDER_STATUS_STEPS.indexOf(step);
                      const currentIndex = ORDER_STATUS_STEPS.findIndex(
                        (s) => s.status === orderData.orderStatus
                      );
                      const isCompleted = stepIndex < currentIndex;
                      const isActive = step.status === orderData.orderStatus;

                      return (
                        <div
                          key={step.status}
                          className="flex flex-col items-center relative z-10"
                        >
                          {/* Step Circle with Icon */}
                          <div
                            className={cn(
                              "w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 transition-all ring-2 ring-offset-2 ring-offset-white",
                              isCompleted || isActive
                                ? "bg-primary text-white ring-primary/30 shadow-md shadow-primary/20"
                                : "bg-slate-200 text-slate-400 ring-slate-300"
                            )}
                          >
                            {getStatusIcon(step.status)}
                          </div>

                          {/* Label */}
                          <span
                            className={cn(
                              "text-sm font-bold mt-3 whitespace-nowrap",
                              isCompleted || isActive ? "text-primary" : "text-slate-500"
                            )}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Cancelled State */
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-red-700">Order Cancelled</h3>
                    <p className="text-sm text-red-600 mt-1">This order has been cancelled</p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Information Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Customer Information */}
              <Card className="border border-slate-200 shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-slate-200">
                  <CardTitle className="text-base font-bold text-slate-900">
                    👤 Customer Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm pt-4">
                  <div className="flex justify-between items-start">
                    <span className="text-slate-600">Name</span>
                    <span className="font-semibold text-slate-900 text-right">
                      {orderData.customerName || "---"}
                    </span>
                  </div>
                  {orderData.customerPhone && (
                    <div className="flex justify-between items-start">
                      <span className="text-slate-600">Phone</span>
                      <a
                        href={`tel:${orderData.customerPhone}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                      >
                        {orderData.customerPhone}
                      </a>
                    </div>
                  )}
                  {orderData.customerEmail && (
                    <div className="flex justify-between items-start">
                      <span className="text-slate-600">Email</span>
                      <a
                        href={`mailto:${orderData.customerEmail}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline font-medium break-all text-right max-w-xs"
                      >
                        {orderData.customerEmail}
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between items-start border-t border-slate-200 pt-3">
                    <span className="text-slate-600">Order Date</span>
                    <span className="font-semibold text-slate-900 text-right">
                      {dateTimeFormat(orderData.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card className="border border-slate-200 shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-slate-200">
                  <CardTitle className="text-base font-bold text-slate-900">
                    💳 Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Method</span>
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full font-semibold text-xs",
                        orderData.paymentMethod === "CASH"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      )}
                    >
                      {orderData.paymentMethod || "---"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Status</span>
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full font-semibold text-xs",
                        orderData.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-700"
                          : orderData.paymentStatus === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      {orderData.paymentStatus || "---"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price Summary */}
            <Card className="border border-slate-200 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="pb-3 border-b border-slate-200">
                <CardTitle className="text-base font-bold text-slate-900">
                  💰 Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">{orderData.items?.length || 0} Items</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(orderData.subtotal || 0)}
                    </span>
                  </div>
                  {(orderData.discountAmount ?? 0) > 0 && (
                    <div className="flex justify-between items-center text-red-600">
                      <span>Discount</span>
                      <span className="font-semibold">
                        -{formatCurrency(orderData.discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total Amount</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(orderData.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            {orderData.items && orderData.items.length > 0 && (
              <Card className="border border-slate-200 shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-slate-200">
                  <CardTitle className="text-base font-bold text-slate-900">
                    🛒 Order Items ({orderData.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {orderData.items.map((item) => (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all bg-slate-50"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        {item.productImageUrl && (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 flex-shrink-0">
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
                            <h4 className="font-semibold text-sm text-slate-900 line-clamp-1">
                              {item.productName}
                            </h4>
                            {item.hasActivePromotion && item.displayPromotionValue != null && (
                              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded font-semibold flex-shrink-0 whitespace-nowrap">
                                {item.displayPromotionType === "PERCENTAGE"
                                  ? `-${item.displayPromotionValue}%`
                                  : `-${formatCurrency(item.displayPromotionValue)}`}
                              </span>
                            )}
                          </div>

                          {/* Size */}
                          {item.sizeName && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full whitespace-nowrap inline-block border border-blue-200">
                                {item.sizeName}
                              </span>
                            </div>
                          )}

                          {/* Pricing */}
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-sm text-slate-900">
                                {formatCurrency(item.displayPrice)} × {item.quantity}
                              </span>
                              {item.hasActivePromotion &&
                                item.displayOriginPrice > item.displayPrice && (
                                  <span className="text-xs text-slate-500 line-through">
                                    {formatCurrency(item.displayOriginPrice)}
                                  </span>
                                )}
                            </div>
                            <span className="font-bold text-green-600 text-sm">
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
              <Card className="border border-slate-200 shadow-sm bg-blue-50">
                <CardHeader className="pb-3 border-b border-slate-200">
                  <CardTitle className="text-base font-bold text-slate-900">
                    📝 Customer Note
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-slate-700">{orderData.customerNote}</p>
                </CardContent>
              </Card>
            )}

            {/* System Information */}
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-slate-200">
                <CardTitle className="text-base font-bold text-slate-900">
                  ⚙️ System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 text-xs">Order ID</p>
                    <p className="text-xs font-mono text-slate-900 break-all mt-1">
                      {orderData.id}
                    </p>
                  </div>
                  {orderData.customerId && (
                    <div>
                      <p className="text-slate-600 text-xs">Customer ID</p>
                      <p className="text-xs font-mono text-slate-900 break-all mt-1">
                        {orderData.customerId}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-slate-600 text-xs">Created At</p>
                    <p className="font-semibold text-slate-900 mt-1">
                      {dateTimeFormat(orderData.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs">Updated At</p>
                    <p className="font-semibold text-slate-900 mt-1">
                      {dateTimeFormat(orderData.updatedAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
