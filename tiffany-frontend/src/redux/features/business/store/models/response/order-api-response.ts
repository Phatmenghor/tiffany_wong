/**
 * Order API Response Models - Simplified structure matching backend
 */

export interface OrderItemApiResponse {
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

export interface OrderApiResponse {
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
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  items: OrderItemApiResponse[];
}
