import { Eye, XCircle, Loader2 } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { formatCurrency } from "@/utils/common/currency-format";
import { getOrderStatusLabel } from "@/enums/order-status.enum";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { indexDisplay } from "@/utils/common/common";
import { OrderResponse } from "@/redux/features/main/store/models/response/order-response";

type Order = OrderResponse;

export function createOrderTableColumns(
  handleViewOrder: (order: Order) => void,
  handleCancelOrder: (order: Order) => void,
  cancelingOrderId: string | null,
  pagination: any
): TableColumn<Order>[] {
  return [
    {
      key: "index",
      label: "#",
      minWidth: "40px",
      maxWidth: "60px",
      render: (_, index) => (
        <span className="font-medium text-xs">
          {indexDisplay(pagination.pageNo || 1, pagination.pageSize || 15, index + 1)}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created Date",
      minWidth: "140px",
      maxWidth: "170px",
      render: (order) => (
        <span className="text-xs text-muted-foreground">
          {dateTimeFormat(order?.createdAt)}
        </span>
      ),
    },
    {
      key: "orderNumber",
      label: "Order #",
      minWidth: "100px",
      maxWidth: "130px",
      render: (order) => (
        <span className="text-xs font-mono font-medium">
          {order?.orderNumber || "---"}
        </span>
      ),
    },
    {
      key: "orderStatus",
      label: "Status",
      minWidth: "120px",
      maxWidth: "150px",
      render: (order) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case "COMPLETED":
            case "READY":
            case "DELIVERED":
              return "bg-green-100 text-green-800 border border-green-300";
            case "CANCELLED":
            case "FAILED":
              return "bg-red-100 text-red-800 border border-red-300";
            case "PENDING":
              return "bg-yellow-100 text-yellow-800 border border-yellow-300";
            case "PREPARING":
            case "CONFIRMED":
            case "PROCESSING":
              return "bg-blue-100 text-blue-800 border border-blue-300";
            case "SHIPPED":
            case "IN_TRANSIT":
              return "bg-cyan-100 text-cyan-800 border border-cyan-300";
            default:
              return "bg-gray-100 text-gray-800 border border-gray-300";
          }
        };
        return (
          <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-md w-fit ${getStatusColor(order?.orderStatus)}`}>
            {getOrderStatusLabel(order?.orderStatus)}
          </span>
        );
      },
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
      minWidth: "120px",
      maxWidth: "150px",
      render: (order) => (
        <span className="text-xs font-medium">
          {order?.paymentMethod || "---"}
        </span>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment Status",
      minWidth: "130px",
      maxWidth: "160px",
      render: (order) => {
        const getPaymentStatusColor = (status: string) => {
          switch (status) {
            case "PAID":
              return "bg-green-100 text-green-800 border border-green-300";
            case "PENDING":
              return "bg-yellow-100 text-yellow-800 border border-yellow-300";
            case "REFUNDED":
              return "bg-purple-100 text-purple-800 border border-purple-300";
            case "UNPAID":
              return "bg-red-100 text-red-800 border border-red-300";
            default:
              return "bg-gray-100 text-gray-800 border border-gray-300";
          }
        };
        return (
          <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-md w-fit ${getPaymentStatusColor(order?.paymentStatus)}`}>
            {order?.paymentStatus || "---"}
          </span>
        );
      },
    },
    {
      key: "items",
      label: "Items",
      minWidth: "80px",
      maxWidth: "110px",
      render: (order) => (
        <span className="text-xs font-medium">
          {order?.items?.length || 0}
        </span>
      ),
    },
    {
      key: "totalAmount",
      label: "Total",
      minWidth: "110px",
      maxWidth: "140px",
      render: (order) => {
        return (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-green-600">
              {formatCurrency(order?.totalAmount || 0)}
            </span>
            {order?.discountAmount && order.discountAmount > 0 && (
              <span className="text-xs text-red-600 font-medium">
                Save {formatCurrency(order.discountAmount)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "100px",
      maxWidth: "130px",
      render: (order) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleViewOrder(order)}
          />
          {order.orderStatus === "PENDING" && (
            <ActionButton
              icon={cancelingOrderId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              tooltip="Cancel Order"
              onClick={() => handleCancelOrder(order)}
              variant="destructive"
              disabled={cancelingOrderId === order.id}
            />
          )}
        </div>
      ),
    },
  ];
}
