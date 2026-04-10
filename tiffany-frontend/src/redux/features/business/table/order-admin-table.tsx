import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { OrderResponse } from "@/redux/features/main/store/models/response/order-response";
import { AllOrderResponseModel } from "../store/models/response/order-admin-response";
import { getOrderStatusLabel } from "@/enums/order-status.enum";
import { formatCurrency } from "@/utils/common/currency-format";
import { Badge } from "@/components/ui/badge";

interface OrderTableHandlers {
  handleViewOrder: (order: OrderResponse) => void;
  handleEditOrder: (order: OrderResponse) => void;
  handleDeleteOrder: (order: OrderResponse) => void;
}

interface OrderTableOptions {
  data: AllOrderResponseModel | null;
  handlers: OrderTableHandlers;
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "COMPLETED":
    case "READY":
      return "default";
    case "CANCELLED":
    case "FAILED":
      return "destructive";
    case "PENDING":
    case "PREPARING":
      return "secondary";
    default:
      return "outline";
  }
};

const getPaymentVariant = (status: string) => {
  switch (status) {
    case "PAID":
      return "default";
    case "UNPAID":
    case "PENDING":
      return "secondary";
    case "REFUNDED":
      return "destructive";
    default:
      return "outline";
  }
};

const getOrderFromVariant = (orderFrom: string) => {
  switch (orderFrom) {
    case "CUSTOMER":
      return "outline";
    case "BUSINESS":
      return "secondary";
    default:
      return "outline";
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
        <span className="text-xs font-mono font-medium">
          {order?.orderNumber || "---"}
        </span>
      ),
    },
    {
      key: "orderFrom",
      label: "Type",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => {
        const getTypeColor = (orderFrom: string) => {
          return orderFrom === "CUSTOMER"
            ? "bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800"
            : "bg-purple-100 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800";
        };
        return (
          <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-md w-fit ${getTypeColor(order?.orderFrom)}`}>
            {order?.orderFrom === "CUSTOMER" ? "Public" : "POS"}
          </span>
        );
      },
    },
    {
      key: "customerName",
      label: "Customer",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (order) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium">{order?.customerName || "Walk-in"}</span>
          <span className="text-xs text-muted-foreground">
            {order?.customerPhone || "No phone"}
          </span>
        </div>
      ),
    },
    {
      key: "items",
      label: "Items",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <span className="text-xs font-medium">
          {order?.items?.length || 0}
        </span>
      ),
    },
    {
      key: "finalTotal",
      label: "Total",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-green-600">
            {formatCurrency(
              order?.pricing?.after?.finalTotal ?? order?.pricing?.before?.finalTotal ?? 0
            )}
          </span>
          {order?.pricing?.hadOrderLevelChangeFromPOS && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(order?.pricing?.before?.finalTotal ?? 0)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "orderStatus",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case "COMPLETED":
            case "READY":
              return "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-800";
            case "CANCELLED":
            case "FAILED":
              return "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800";
            case "PENDING":
              return "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-800";
            case "PREPARING":
            case "CONFIRMED":
            case "PROCESSING":
              return "bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800";
            case "SHIPPED":
            case "IN_TRANSIT":
              return "bg-cyan-100 dark:bg-cyan-950/30 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800";
            default:
              return "bg-gray-100 dark:bg-gray-950/30 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-800";
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
      key: "paymentStatus",
      label: "Payment",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => {
        const getPaymentColor = (status: string) => {
          switch (status) {
            case "PAID":
              return "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-800";
            case "PENDING":
              return "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-800";
            case "REFUNDED":
              return "bg-purple-100 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800";
            case "UNPAID":
              return "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800";
            default:
              return "bg-gray-100 dark:bg-gray-950/30 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-800";
          }
        };
        return (
          <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-md w-fit ${getPaymentColor(order?.payment?.paymentStatus)}`}>
            {order?.payment?.paymentStatus || "---"}
          </span>
        );
      },
    },
    {
      key: "deliveryOption",
      label: "Delivery",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <span className="text-xs font-semibold px-2.5 py-1.5 rounded-md w-fit bg-indigo-100 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
          {order?.deliveryOption?.name || "---"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <span className="text-xs text-muted-foreground">
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
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleViewOrder(order)}
          />
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit Order"
            onClick={() => handleEditOrder(order)}
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Order"
            onClick={() => handleDeleteOrder(order)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
