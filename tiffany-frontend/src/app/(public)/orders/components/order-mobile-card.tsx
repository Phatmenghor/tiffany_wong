"use client";

import { Eye, XCircle, Loader2 } from "lucide-react";
import { OrderResponse } from "@/redux/features/main/store/models/response/order-response";
import { formatCurrency } from "@/utils/common/currency-format";
import { getOrderStatusLabel } from "@/enums/order-status.enum";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { CustomButton } from "@/components/shared/button/custom-button";

interface OrderMobileCardProps {
  order: OrderResponse;
  onView: (order: OrderResponse) => void;
  onCancel: (order: OrderResponse) => void;
  isCanceling: boolean;
}

// PENDING | CONFIRMED | COMPLETED | CANCELLED
function getOrderStatusColor(status: string) {
  switch (status) {
    case "COMPLETED": return "bg-green-100 text-green-800 border-green-300";
    case "CANCELLED": return "bg-red-100 text-red-800 border-red-300";
    case "PENDING":   return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "CONFIRMED": return "bg-blue-100 text-blue-800 border-blue-300";
    default:          return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

// PAID | UNPAID | REFUNDED
function getPaymentStatusColor(status: string) {
  switch (status) {
    case "PAID":     return "bg-green-100 text-green-800 border-green-300";
    case "UNPAID":   return "bg-red-100 text-red-800 border-red-300";
    case "REFUNDED": return "bg-purple-100 text-purple-800 border-purple-300";
    default:         return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

export function OrderMobileCard({ order, onView, onCancel, isCanceling }: OrderMobileCardProps) {
  return (
    <div className="rounded-[0.4875rem] border border-border bg-background p-[0.65rem] space-y-[0.4875rem] shadow-sm">
      {/* Top row: order number + date */}
      <div className="flex items-start justify-between gap-[0.4875rem]">
        <div>
          <p className="text-[11px] font-mono font-semibold text-foreground">
            {order.orderNumber || "---"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-[0.1rem]">
            {dateTimeFormat(order.createdAt)}
          </p>
        </div>
        <span className={`text-[10px] font-semibold px-[0.4875rem] py-[0.1625rem] rounded-full border shrink-0 ${getOrderStatusColor(order.orderStatus)}`}>
          {getOrderStatusLabel(order.orderStatus)}
        </span>
      </div>

      {/* Middle row: items, payment method, payment status */}
      <div className="flex items-center gap-[0.4875rem] flex-wrap">
        <span className="text-[10px] text-muted-foreground">
          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
        </span>
        <span className="text-[10px] text-muted-foreground">·</span>
        <span className="text-[10px] text-muted-foreground">{order.paymentMethod || "---"}</span>
        <span className={`text-[10px] font-semibold px-[0.325rem] py-[0.08rem] rounded border ${getPaymentStatusColor(order.paymentStatus)}`}>
          {order.paymentStatus || "---"}
        </span>
      </div>

      {/* Bottom row: total + actions */}
      <div className="flex items-center justify-between gap-[0.4875rem]">
        <div>
          <p className="text-[12px] font-bold text-green-600">
            {formatCurrency(order.totalAmount || 0)}
          </p>
          {(order.discountAmount ?? 0) > 0 && (
            <p className="text-[10px] text-red-500 font-medium">
              Save {formatCurrency(order.discountAmount)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-[0.325rem]">
          <CustomButton
            variant="outline"
            size="sm"
            onClick={() => onView(order)}
            className="h-[1.95rem] px-[0.65rem] gap-[0.24375rem] text-[11px]"
          >
            <Eye className="h-[0.65rem] w-[0.65rem]" />
            View
          </CustomButton>
          {order.orderStatus === "PENDING" && (
            <CustomButton
              variant="destructive"
              size="sm"
              onClick={() => onCancel(order)}
              disabled={isCanceling}
              className="h-[1.95rem] px-[0.65rem] gap-[0.24375rem] text-[11px]"
            >
              {isCanceling
                ? <Loader2 className="h-[0.65rem] w-[0.65rem] animate-spin" />
                : <XCircle className="h-[0.65rem] w-[0.65rem]" />
              }
              Cancel
            </CustomButton>
          )}
        </div>
      </div>
    </div>
  );
}
