"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/store";
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
import { showToast } from "@/components/shared/common/show-toast";

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
        <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
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
        <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground">
                {detailError
                  ? `Error: ${detailError}`
                  : "No order data available"}
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
                              ? "text-green-600 font-medium"
                              : "text-orange-600 font-medium"
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
                          className="text-blue-600 hover:text-blue-700 font-medium"
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
                            className="text-blue-600 hover:text-blue-700 font-medium break-all"
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
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">💰 Pricing Details</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-2">
                      <h5 className="text-xs font-medium text-gray-700 font-bold mb-2">📌 Order Total</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <DisplayField
                          label="Total Items"
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
                              <span className="text-red-600 font-semibold">
                                -{formatCurrency(orderData.discountAmount)}
                              </span>
                            }
                          />
                        )}
                        <DisplayField
                          label="Total Amount"
                          value={
                            <span className="text-lg font-bold text-green-600">
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
                    <div key={item.id} className="p-4 border rounded-lg bg-gray-50">
                      {/* Product Image and Header */}
                      <div className="mb-3">
                        <div className="flex items-start gap-3">
                          {/* Product Image */}
                          {item.productImageUrl && (
                            <div className="flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
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
                                #{idx + 1} - {item.productName}
                              </h4>
                              {item.hasActivePromotion && (
                                <span className="text-xs px-2 py-1 bg-red-600 text-white rounded whitespace-nowrap">
                                  💰 Discounted
                                </span>
                              )}
                            </div>
                            {/* Size and SKU */}
                            <div className="flex flex-wrap gap-3 text-xs">
                              {item.sizeName && (
                                <span className="text-muted-foreground">
                                  Size: <span className="font-medium">{item.sizeName}</span>
                                </span>
                              )}
                              {item.sku && (
                                <span className="text-muted-foreground">
                                  SKU: <span className="font-mono font-medium text-foreground">{item.sku}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Item Pricing */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">Quantity:</span>
                          <p className="font-medium">{item.quantity}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Unit Price:</span>
                          <p className="font-medium">{formatCurrency(item.displayPrice)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Subtotal:</span>
                          <p className="font-bold text-green-600">
                            {formatCurrency(item.subtotalAfterDiscount || 0)}
                          </p>
                        </div>
                        {item.hasActivePromotion && item.subtotalDiscountAmount && (
                          <div>
                            <span className="text-muted-foreground">Discount:</span>
                            <p className="font-medium text-red-600">
                              -{formatCurrency(item.subtotalDiscountAmount)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}


            {/* System Information */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/30">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-bold text-foreground">⚙️ System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DisplayField
                      label="Order ID"
                      value={
                        <span className="text-xs font-mono break-all">
                          {orderData.id}
                        </span>
                      }
                    />
                    {orderData.customerId && (
                      <DisplayField
                        label="Customer ID"
                        value={
                          <span className="text-xs font-mono break-all">
                            {orderData.customerId}
                          </span>
                        }
                      />
                    )}
                    <DisplayField
                      label="Created At"
                      value={dateTimeFormat(orderData.createdAt)}
                    />
                    <DisplayField
                      label="Updated At"
                      value={dateTimeFormat(orderData.updatedAt)}
                    />
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
