/**
 * Order Domain Types
 * Orders, items, shipping, payments
 */

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerEmail?: string;
  items: OrderItem[];
  subtotal: number;
  tax?: number;
  shippingCost?: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress?: ShippingAddress;
  billingAddress?: BillingAddress;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  size?: string;
  totalPrice: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface BillingAddress extends ShippingAddress {
  sameAsShipping?: boolean;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface OrderFilter {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateRange?: [string, string];
  customerEmail?: string;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
}
