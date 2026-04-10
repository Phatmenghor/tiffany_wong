/**
 * Order Types
 * Order-related models and interfaces
 */

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  businessId?: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  tax?: number;
  shippingCost?: number;
  discountAmount?: number;
  paymentMethod?: string;
  paymentStatus: PaymentStatus;
  shippingAddress?: ShippingAddress;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deliveryDate?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  size?: string;
  variant?: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
}

export interface OrderCreateRequest {
  items: OrderItemInput[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  notes?: string;
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
  size?: string;
  variant?: string;
}

export interface OrderUpdateRequest {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  notes?: string;
  shippingAddress?: ShippingAddress;
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export interface OrderListResponse {
  data: Order[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OrderFilter {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}
