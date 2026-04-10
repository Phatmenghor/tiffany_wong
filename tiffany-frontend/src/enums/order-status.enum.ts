// Order Status Enum - matches backend OrderStatus enum
// Backend values: PENDING, CONFIRMED, COMPLETED, CANCELLED
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Display names and descriptions for UI
export const OrderStatusConfig = {
  [OrderStatus.PENDING]: {
    label: 'Pending',
    description: 'Order placed, awaiting confirmation',
    color: 'warning',
  },
  [OrderStatus.CONFIRMED]: {
    label: 'Confirmed',
    description: 'Order confirmed',
    color: 'info',
  },
  [OrderStatus.COMPLETED]: {
    label: 'Completed',
    description: 'Order delivered/completed',
    color: 'success',
  },
  [OrderStatus.CANCELLED]: {
    label: 'Cancelled',
    description: 'Order cancelled',
    color: 'danger',
  },
};

export const getOrderStatusLabel = (status: OrderStatus): string => {
  return OrderStatusConfig[status]?.label || status;
};

export const getOrderStatusColor = (status: OrderStatus): string => {
  return OrderStatusConfig[status]?.color || 'secondary';
};

export const getOrderStatusDescription = (status: OrderStatus): string => {
  return OrderStatusConfig[status]?.description || '';
};

export const isOrderActive = (status: OrderStatus): boolean => {
  return status !== OrderStatus.CANCELLED && status !== OrderStatus.COMPLETED;
};

export const isOrderTerminal = (status: OrderStatus): boolean => {
  return status === OrderStatus.COMPLETED || status === OrderStatus.CANCELLED;
};
