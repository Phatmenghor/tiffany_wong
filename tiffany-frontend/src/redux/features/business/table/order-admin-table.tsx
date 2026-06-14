import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { OrderResponse } from "@/redux/features/main/store/models/response/order-response";
import { AllOrderResponseModel } from "../store/models/response/order-admin-response";
import { getOrderStatusLabel } from "@/enums/order-status.enum";
import { formatCurrency } from "@/utils/common/currency-format";

interface OrderTableHandlers {
  handleViewOrder: (order: OrderResponse) => void;
  handleEditOrder: (order: OrderResponse) => void;
  handleDeleteOrder: (order: OrderResponse) => void;
}

interface OrderTableOptions {
  data: AllOrderResponseModel | null;
  handlers: OrderTableHandlers;
}

// PENDING | CONFIRMED | COMPLETED | CANCELLED
const getOrderStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED":  return "bg-green-100 text-green-800 border border-green-300";
    case "CANCELLED":  return "bg-red-100 text-red-800 border border-red-300";
    case "PENDING":    return "bg-yellow-100 text-yellow-800 border border-yellow-300";
    case "CONFIRMED":  return "bg-blue-100 text-blue-800 border border-blue-300";
    default:           return "bg-gray-100 text-gray-800 border border-gray-300";
  }
};

// PAID | UNPAID | REFUNDED
const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "PAID":      return "bg-green-100 text-green-800 border border-green-300";
    case "UNPAID":    return "bg-red-100 text-red-800 border border-red-300";
    case "REFUNDED":  return "bg-purple-100 text-purple-800 border border-purple-300";
    default:          return "bg-gray-100 text-gray-800 border border-gray-300";
  }
};

export const orderAdminTableColumns = ({
  data,
  handlers,
}: OrderTableOptions): TableColumn<OrderResponse>[] => {
  const { handleViewOrder, handleEditOrder, handleDeleteOrder } = handlers;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "400px",
      render: (_, index) => (
        <span className="font-medium">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 15, index + 1)}
        </span>
      ),
    },
    {
      key: "orderNumber",
      label: "Order #",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <span className="font-mono font-medium">
          {order?.orderNumber || "---"}
        </span>
      ),
    },
    {
      key: "customerName",
      label: "Customer",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (order) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {order?.customerName || "Walk-in"}
          </span>
          <span className="text-muted-foreground">
            {order?.customerPhone || "No phone"}
          </span>
        </div>
      ),
    },
    {
      key: "orderStatus",
      label: "Status",
      minWidth: "120px",
      maxWidth: "150px",
      render: (order) => (
        <span className={`font-semibold px-[0.40625rem] py-[0.24375rem] rounded-[0.24375rem] w-fit ${getOrderStatusColor(order?.orderStatus)}`}>
          {getOrderStatusLabel(order?.orderStatus)}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
      minWidth: "120px",
      maxWidth: "150px",
      render: (order) => (
        <span className="font-medium">{order?.paymentMethod || "---"}</span>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment Status",
      minWidth: "130px",
      maxWidth: "160px",
      render: (order) => (
        <span className={`font-semibold px-[0.40625rem] py-[0.24375rem] rounded-[0.24375rem] w-fit ${getPaymentStatusColor(order?.paymentStatus)}`}>
          {order?.paymentStatus || "---"}
        </span>
      ),
    },
    {
      key: "items",
      label: "Items",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <span className="font-medium">{order?.items?.length || 0}</span>
      ),
    },
    {
      key: "totalAmount",
      label: "Total",
      minWidth: "110px",
      maxWidth: "140px",
      render: (order) => (
        <div className="flex flex-col">
          <span className="font-bold text-green-600">
            {formatCurrency(order?.totalAmount || 0)}
          </span>
          {(order?.discountAmount ?? 0) > 0 && (
            <span className="text-red-600 font-medium">
              Save {formatCurrency(order.discountAmount)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created Date",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <span className="text-muted-foreground">
          {dateTimeFormat(order?.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <div className="flex items-center gap-[0.325rem]">
          <ActionButton
            icon={<Eye className="w-[0.65rem] h-[0.65rem]" />}
            tooltip="View Details"
            onClick={() => handleViewOrder(order)}
          />
          <ActionButton
            icon={<Edit className="w-[0.65rem] h-[0.65rem]" />}
            tooltip="Edit Order"
            onClick={() => handleEditOrder(order)}
          />
          <ActionButton
            icon={<Trash className="w-[0.65rem] h-[0.65rem]" />}
            tooltip="Delete Order"
            onClick={() => handleDeleteOrder(order)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
