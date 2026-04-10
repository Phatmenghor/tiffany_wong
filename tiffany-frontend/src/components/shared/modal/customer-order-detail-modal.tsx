"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchOrderDetailsService } from "@/redux/features/main/store/thunks/my-orders-thunks";
import { formatCurrency } from "@/utils/common/currency-format";
import { getOrderStatusLabel } from "@/enums/order-status.enum";
import { Loading } from "@/components/shared/common/loading";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { showToast } from "@/components/shared/common/show-toast";
import { OrderResponse } from "@/redux/features/main/store/models/response/order-response";
import { useState } from "react";

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
        <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
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
        <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground">
                {state.error
                  ? `Error: ${state.error}`
                  : "No order data available"}
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">
        Order Details - {orderData.orderNumber}
      </DialogTitle>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Order Details
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {orderData.orderNumber}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Order & Pricing Information */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/30">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-bold text-foreground">📋 Order & Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Order Details */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Order Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <DisplayField
                      label="Order Number"
                      value={orderData.orderNumber}
                    />
                    <DisplayField
                      label="Order Status"
                      value={getOrderStatusLabel(orderData.orderStatus)}
                    />
                    <DisplayField
                      label="Created At"
                      value={dateTimeFormat(orderData.createdAt)}
                    />
                    <DisplayField
                      label="Payment Method"
                      value={orderData.paymentMethod || "---"}
                    />
                    <DisplayField
                      label="Payment Status"
                      value={
                        <span
                          className={
                            orderData.paymentStatus === "PAID"
                              ? "text-green-600 dark:text-green-400 font-medium"
                              : "text-orange-600 dark:text-orange-400 font-medium"
                          }
                        >
                          {orderData.paymentStatus || "---"}
                        </span>
                      }
                    />
                    <DisplayField
                      label="Customer Name"
                      value={
                        <span className="font-semibold text-foreground">
                          {orderData.customerName || "Customer"}
                        </span>
                      }
                    />
                    <DisplayField
                      label="Phone Number"
                      value={
                        <a
                          href={`tel:${orderData.customerPhone}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                        >
                          {orderData.customerPhone || "---"}
                        </a>
                      }
                    />
                    {orderData.customerEmail && (
                      <DisplayField
                        label="Email"
                        value={
                          <a
                            href={`mailto:${orderData.customerEmail}`}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium break-all"
                          >
                            {orderData.customerEmail}
                          </a>
                        }
                      />
                    )}
                    {orderData.customerNote && (
                      <DisplayField
                        label="Customer Note"
                        value={orderData.customerNote}
                      />
                    )}
                  </div>
                </div>

                {/* Pricing Details */}
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
                  <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-3">💰 Pricing Details</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-900 rounded p-3 space-y-2">
                      <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 font-bold mb-2">📌 Order Total</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <DisplayField
                          label="Items"
                          value={String(orderData.items?.length || 0)}
                        />
                        <DisplayField
                          label="Subtotal"
                          value={formatCurrency(orderData.subtotal || 0)}
                        />
                        {(orderData.discountAmount ?? 0) > 0 && (
                          <DisplayField
                            label="Discount"
                            value={
                              <span className="text-red-600 dark:text-red-400 font-semibold">
                                -{formatCurrency(orderData.discountAmount)}
                              </span>
                            }
                          />
                        )}
                        <DisplayField
                          label="Total Amount"
                          value={
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(orderData.totalAmount || 0)}
                            </span>
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            {orderData.items && orderData.items.length > 0 && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/30">
                <CardHeader className="pb-4 border-b">
                  <CardTitle className="text-lg font-bold text-foreground">
                    🛒 Order Items ({orderData.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {orderData.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 border border-border/50 rounded-lg bg-card"
                    >
                      {/* Product Image and Header */}
                      <div className="mb-3">
                        <div className="flex items-start gap-3">
                          {/* Product Image */}
                          {item.productImageUrl && (
                            <div className="flex-shrink-0 rounded-lg overflow-hidden border border-border">
                              <img
                                src={item.productImageUrl}
                                alt={item.productName}
                                className="w-16 h-16 object-cover"
                              />
                            </div>
                          )}
                          {/* Product Name and Details */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-sm">
                                #{idx + 1} - {item.productName || "Unknown"}
                              </h4>
                              {item.hasActivePromotion && (
                                <span className="text-xs px-2 py-1 bg-red-600 dark:bg-red-700 text-white rounded whitespace-nowrap">
                                  💰 Discounted
                                </span>
                              )}
                            </div>
                            {/* Size and SKU */}
                            <div className="text-xs text-muted-foreground space-y-0.5">
                              {item.sizeName && (
                                <div>
                                  Size: <span className="font-medium">{item.sizeName}</span>
                                </div>
                              )}
                              {item.sku && (
                                <div>
                                  SKU: <span className="font-mono font-medium">{item.sku}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Item Pricing */}
                      <div className="space-y-3">
                        {/* Quantity and Pricing */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-xs">Quantity</span>
                            <p className="font-medium">{item.quantity}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-xs">Unit Price</span>
                            <p className="font-medium">
                              {formatCurrency(item.displayPrice)}
                            </p>
                          </div>
                          {item.displayOriginPrice && item.displayOriginPrice !== item.displayPrice && (
                            <div>
                              <span className="text-muted-foreground block text-xs">Original Price</span>
                              <p className="font-medium line-through text-muted-foreground">
                                {formatCurrency(item.displayOriginPrice)}
                              </p>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground block text-xs">Subtotal</span>
                            <p className="font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(item.subtotalAfterDiscount || 0)}
                            </p>
                          </div>
                        </div>

                        {/* Promotion Details */}
                        {item.hasActivePromotion && item.displayPromotionType && (
                          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded p-2.5">
                            <h5 className="text-xs font-bold text-red-700 dark:text-red-300 mb-2">🎯 Promotion Details</h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground text-xs">Type</span>
                                <p className="font-medium">
                                  {item.displayPromotionType === "FIXED_AMOUNT" ? "Fixed Amount" : "Percentage"}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground text-xs">Value</span>
                                <p className="font-medium">
                                  {item.displayPromotionType === "FIXED_AMOUNT"
                                    ? `-${formatCurrency(item.displayPromotionValue || 0)}`
                                    : `-${item.displayPromotionValue}%`}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground text-xs">Discount Amount</span>
                                <p className="font-bold text-red-600 dark:text-red-400">
                                  -{formatCurrency(item.subtotalDiscountAmount || 0)}
                                </p>
                              </div>
                              {item.displayPromotionFromDate && (
                                <div>
                                  <span className="text-muted-foreground text-xs">From</span>
                                  <p className="font-medium text-xs">
                                    {dateTimeFormat(item.displayPromotionFromDate)}
                                  </p>
                                </div>
                              )}
                              {item.displayPromotionToDate && (
                                <div>
                                  <span className="text-muted-foreground text-xs">To</span>
                                  <p className="font-medium text-xs">
                                    {dateTimeFormat(item.displayPromotionToDate)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Subtotal Breakdown */}
                        {item.subtotalBeforeDiscount !== item.subtotalAfterDiscount && (
                          <div className="border-t pt-2">
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground text-xs">Before Discount</span>
                                <p className="font-medium line-through">
                                  {formatCurrency(item.subtotalBeforeDiscount || 0)}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground text-xs">Discount</span>
                                <p className="font-medium text-red-600 dark:text-red-400">
                                  -{formatCurrency(item.subtotalDiscountAmount || 0)}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground text-xs">After Discount</span>
                                <p className="font-bold text-green-600 dark:text-green-400">
                                  {formatCurrency(item.subtotalAfterDiscount || 0)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
