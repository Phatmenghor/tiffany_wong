/**
 * Order Response Types
 * Simplified type definitions matching backend OrderResponse
 */

import { OrderStatus } from "@/enums/order-status.enum";

export type PaymentMethod = "CASH" | "BANK";
export type PaymentStatus = "PAID" | "UNPAID" | "REFUNDED";

// Order Item Response - matches CartItemResponse structure for consistency
export interface OrderItemResponse {
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

export interface OrderResponse {
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
  items: OrderItemResponse[];
}
