/**
 * Order Type Definitions - Simplified structure matching backend
 */

export type PaymentMethod = "CASH" | "BANK";
export type PaymentStatus = "PAID" | "UNPAID" | "REFUNDED";
export type OrderStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

/**
 * Order Item - matches backend OrderItemResponse
 */
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  productSizeId: string | null;
  sizeName: string;
  sku: string;
  quantity: number;

  // Display fields for UI rendering
  displayPrice: number;
  displayOriginPrice: number;
  displayPromotionType: string | null;
  displayPromotionValue: number | null;
  displayPromotionFromDate: string | null;
  displayPromotionToDate: string | null;
  hasActivePromotion: boolean;

  // Subtotal calculations
  subtotalBeforeDiscount: number;
  subtotalDiscountAmount: number;
  subtotalAfterDiscount: number;
}

/**
 * Order - Simplified customer-focused structure
 */
export interface Order {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerNote: string | null;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  items: OrderItem[];
}
