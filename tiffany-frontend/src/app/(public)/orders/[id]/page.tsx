"use client";

import { useEffect, useState } from "react";
import { OrderStatus, getOrderStatusLabel, getOrderStatusColor } from "@/enums/order-status.enum";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Printer,
  Share2,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Home,
  MessageSquare,
  HelpCircle,
  Check,
  Zap,
} from "lucide-react";
import { useAppDispatch } from "@/redux/store";
import {
  fetchOrderDetailsService,
  cancelOrderService,
} from "@/redux/features/main/store/thunks/my-orders-thunks";
import { AppDefault } from "@/constants/app-resource/default/default";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";
import { formatCurrency } from "@/utils/common/currency-format";
import { dateTimeFormat, formatDate } from "@/utils/date/date-time-format";
import { OrderResponse } from "@/redux/features/main/store/models/response/order-response";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode; lightBg: string }
> = {
  PENDING: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    lightBg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-400",
    icon: <Clock className="h-4 w-4" />,
  },
  CONFIRMED: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    lightBg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-400",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  PROCESSING: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    lightBg: "bg-purple-50 dark:bg-purple-950/30",
    text: "text-purple-700 dark:text-purple-400",
    icon: <Package className="h-4 w-4" />,
  },
  SHIPPED: {
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    lightBg: "bg-cyan-50 dark:bg-cyan-950/30",
    text: "text-cyan-700 dark:text-cyan-400",
    icon: <Truck className="h-4 w-4" />,
  },
  DELIVERED: {
    bg: "bg-green-100 dark:bg-green-900/30",
    lightBg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-700 dark:text-green-400",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  CANCELLED: {
    bg: "bg-red-100 dark:bg-red-900/30",
    lightBg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-400",
    icon: <XCircle className="h-4 w-4" />,
  },
};

// Status timeline will be fetched from API
interface StatusTimelineItem {
  id: string;
  name: string;
  order: number;
}

interface OrderDetailState {
  order: OrderResponse | null;
  loading: boolean;
  error: string | null;
  cancelling: boolean;
  statusTimeline: StatusTimelineItem[];
}

export default function OrderDetailPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useParams();
  const orderId = params.id as string;

  const [state, setState] = useState<OrderDetailState>({
    order: null,
    loading: true,
    error: null,
    cancelling: false,
    statusTimeline: [],
  });

  const [copied, setCopied] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Fetch order details and status timeline
  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        // Fetch order details
        const orderResult = await dispatch(fetchOrderDetailsService(orderId)).unwrap();

        // Fetch order statuses (filtered to ACTIVE only, sorted by order on backend)
        const statusResult = await dispatch(
          fetchAllOrderStatusService({
            statuses: ["ACTIVE"],
            pageNo: 1,
            pageSize: 100,
          })
        ).unwrap();

        // Statuses are already sorted by order field on the backend
        const sortedStatuses = statusResult.content || [];

        setState((prev) => ({
          ...prev,
          order: orderResult,
          statusTimeline: sortedStatuses,
          loading: false,
        }));
      } catch (error: any) {
        console.error("Failed to fetch order details:", error);
        setState((prev) => ({
          ...prev,
          error: error?.message || "Failed to load order details",
          loading: false,
        }));
      }
    };

    fetchOrderDetails();
  }, [orderId, dispatch]);

  const handleCopyOrderNumber = () => {
    if (state.order) {
      navigator.clipboard.writeText(state.order.orderNumber);
      setCopied(true);
      showToast.success("Order number copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!state.order) return;

    const shareText = `Order #${state.order.orderNumber} - ${formatCurrency(state.order.pricing.finalTotal)}`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Order Details",
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast.success("Order link copied to clipboard");
    }
  };

  const handleCancelOrder = async () => {
    if (!state.order || state.order.orderStatus === "CANCELLED") {
      return;
    }

    try {
      setState((prev) => ({ ...prev, cancelling: true }));
      await dispatch(cancelOrderService(orderId)).unwrap();
      showToast.success("Order cancelled successfully");
      setState((prev) => ({
        ...prev,
        order: prev.order
          ? {
              ...prev.order,
              orderProcessStatus: {
                ...prev.order.orderProcessStatus,
                name: "CANCELLED",
              },
            }
          : null,
        cancelling: false,
      }));
      setShowCancelConfirm(false);
    } catch (error: any) {
      showToast.error(error?.message || "Failed to cancel order");
      setState((prev) => ({ ...prev, cancelling: false }));
    }
  };

  const canCancel =
    state.order &&
    (state.order.orderStatus === "PENDING" ||
      state.order.orderStatus === "CONFIRMED");

  const getStatusPosition = (status: string | null): number => {
    if (!status) return -1;
    const statusEntry = state.statusTimeline.find((s) => s.name === status);
    return statusEntry?.order ?? -1;
  };

  if (state.loading) {
    return <OrderDetailSkeleton />;
  }

  if (state.error || !state.order) {
    return (
      <PageContainer className="py-6 sm:py-8">
        <div className="mb-6">
          <CustomButton
            variant="ghost"
            className="gap-2 h-10 px-4 rounded-lg"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </CustomButton>
        </div>

        <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-8">
          <div className="flex items-start gap-4 max-w-md mx-auto text-center">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 flex-shrink-0 mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-red-900 dark:text-red-200">
                Order Not Found
              </h2>
              <p className="text-red-800 dark:text-red-300 text-sm mt-2">
                {state.error || "The order you're looking for doesn't exist."}
              </p>
              <CustomButton
                onClick={() => router.push("/orders")}
                className="mt-6 w-full h-11 rounded-xl"
              >
                Back to Orders
              </CustomButton>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  const order = state.order;
  const statusColor =
    STATUS_COLORS[order.orderStatus || "PENDING"] ||
    STATUS_COLORS.PENDING;
  const currentStatusPosition = getStatusPosition(
    order.orderStatus || null
  );

  const formattedDeliveryAddress = [
    order.deliveryAddress?.houseNumber,
    order.deliveryAddress?.streetNumber
      ? `St. ${order.deliveryAddress.streetNumber}`
      : null,
    order.deliveryAddress?.village,
    order.deliveryAddress?.commune,
    order.deliveryAddress?.district,
    order.deliveryAddress?.province,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <PageContainer className="py-6 sm:py-8">
      {/* Back Button */}
      <div className="mb-6">
        <CustomButton
          variant="ghost"
          className="gap-2 h-10 px-4 rounded-lg"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </CustomButton>
      </div>

      {/* Header */}
      <PageHeader
        title="Order Details"
        icon={Package}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary Card */}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Order Summary
            </h2>

            <div className="space-y-4">
              {/* Order Number with Copy */}
              <div className="flex items-start justify-between pb-4 border-b border-border/50">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Order Number
                  </p>
                  <p className="text-base font-mono font-bold text-foreground">
                    {order.orderNumber}
                  </p>
                </div>
                <CustomButton
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3 rounded-lg gap-2"
                  onClick={handleCopyOrderNumber}
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy"}
                </CustomButton>
              </div>

              {/* Order Date/Time */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/50">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Date
                  </p>
                  <p className="text-sm text-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Time
                  </p>
                  <p className="text-sm text-foreground">
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Payment Status Only */}
              <div className="pb-4 border-b border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Payment Status
                </p>
                <div
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-xs",
                    order.payment?.paymentStatus === "PAID"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : order.payment?.paymentStatus === "PENDING"
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        : "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400"
                  )}
                >
                  {order.payment?.paymentStatus === "PAID" && (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  {order.payment?.paymentStatus || "Unknown"}
                </div>
              </div>

              {/* Delivery Method */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Delivery Method
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {order.deliveryOption?.name || "Standard"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Delivery Fee
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(order.pricing?.deliveryFee || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline - Horizontal Steps */}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-6">
              Order Progress
            </h2>

            {state.statusTimeline.length > 0 ? (
              <div>
                {/* Linear Progress Bar */}
                <div className="flex items-center gap-0 mb-8">
                  {state.statusTimeline.map((status, index) => {
                    const statusOrder = status.order || 0;
                    const isCompleted = currentStatusPosition >= statusOrder;
                    const isCurrent = currentStatusPosition === statusOrder;

                    return (
                      <div
                        key={status.id}
                        className="flex items-center flex-1 gap-0"
                      >
                        {/* Step Circle */}
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ring-2 ring-offset-2 dark:ring-offset-slate-950",
                            isCompleted
                              ? "bg-primary text-primary-foreground ring-primary/30 shadow-md shadow-primary/20"
                              : isCurrent
                                ? "bg-primary/20 text-primary ring-primary/50 shadow-lg shadow-primary/20 animate-pulse"
                                : "bg-muted text-muted-foreground ring-muted"
                          )}
                        >
                          {isCompleted ? (
                            <Check className="h-6 w-6" />
                          ) : isCurrent ? (
                            <span className="text-lg">●</span>
                          ) : (
                            status.order
                          )}
                        </div>

                        {/* Connector Line */}
                        {index < state.statusTimeline.length - 1 && (
                          <div
                            className={cn(
                              "flex-1 h-1.5 mx-1 transition-colors",
                              isCompleted
                                ? "bg-gradient-to-r from-primary to-primary"
                                : "bg-muted"
                            )}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Status Labels and Dates */}
                <div className="flex items-flex-start gap-0">
                  {state.statusTimeline.map((status, index) => {
                    const statusOrder = status.order || 0;
                    const isCompleted = currentStatusPosition >= statusOrder;
                    const statusHistory = order.statusHistory?.find(
                      (h) => h.statusName === status.name
                    );

                    return (
                      <div
                        key={status.id}
                        className="flex flex-col items-center flex-1"
                      >
                        <span className={cn(
                          "text-xs font-bold whitespace-nowrap px-2 block text-center",
                          isCompleted
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}>
                          {status.name}
                        </span>
                        {statusHistory && (
                          <span className="text-xs text-muted-foreground block mt-1 text-center whitespace-nowrap px-2">
                            {new Date(statusHistory.changedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {!statusHistory && (
                          <span className="text-xs text-muted-foreground/50 block mt-1 text-center italic">
                            Pending
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No status timeline available
              </p>
            )}
          </div>

          {/* Order Items */}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Order Items ({order.items?.length || 0})
            </h2>

            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted border border-border/50">
                      {item.product?.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {item.product?.name || "Unknown Product"}
                          </h3>
                          {item.product?.sizeName && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Size: {item.product.sizeName}
                            </p>
                          )}
                        </div>
                        {item.hasActivePromotion && (
                          <div className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-semibold flex-shrink-0">
                            Sale
                          </div>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {formatCurrency(item.currentPrice)} × {item.quantity}
                          </span>
                          <span className="font-semibold text-foreground">
                            {formatCurrency(item.totalPrice)}
                          </span>
                        </div>

                        {item.discountAmount > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-green-700 dark:text-green-400">
                              Discount
                            </span>
                            <span className="text-green-700 dark:text-green-400 font-semibold">
                              -{formatCurrency(item.discountAmount)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No items in this order
                </p>
              )}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Pricing Summary
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(order.pricing?.before?.subtotal || 0)}
                </span>
              </div>

              {order.pricing?.before?.discountAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Discount</span>
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                    -{formatCurrency(order.pricing.before.discountAmount)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Delivery Fee
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(order.pricing?.before?.deliveryFee || 0)}
                </span>
              </div>

              {order.pricing?.before?.taxAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tax</span>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(order.pricing.before.taxAmount)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(order.pricing?.before?.finalTotal || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Info Cards */}
        <div className="space-y-6">
          {/* Delivery Information */}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Delivery Address
            </h2>

            <div className="space-y-3">
              <p className="text-sm text-foreground leading-relaxed">
                {formattedDeliveryAddress || "No address provided"}
              </p>

              {order.deliveryAddress?.note && (
                <div className="pt-3 border-t border-border/50">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Delivery Notes
                  </p>
                  <p className="text-sm text-foreground">
                    {order.deliveryAddress.note}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Customer Info
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Name
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {order.customerName || "Unknown"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Phone
                </p>
                <a
                  href={`tel:${order.customerPhone}`}
                  className="text-sm font-semibold text-primary hover:underline flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  {order.customerPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Customer Notes */}
          {order.customerNote && (
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Customer Notes
              </h2>

              <p className="text-sm text-foreground leading-relaxed">
                {order.customerNote}
              </p>
            </div>
          )}

