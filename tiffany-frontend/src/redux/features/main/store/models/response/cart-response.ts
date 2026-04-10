export interface CartResponseModel {
  items: CartItemModel[];
  totalItems: number;                 // Number of unique products
  totalQuantity?: number;              // Total quantity across all items
  subtotalBeforeDiscount?: number;  // Original price total (currentPrice * qty)
  subtotal: number;                  // Final price total before shipping/fees
  discountAmount: number;              // Total discount applied
  finalTotal: number;                 // Final total (subtotal + shipping/fees)
}

export interface CartItemModel {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  productSizeId: string | null;
  sizeName: string | null;
  sku?: string;
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
  subtotalBeforeDiscount?: number;
  subtotalDiscountAmount?: number;
  subtotalAfterDiscount?: number;

  // Backward compatibility fields
  lastOptimisticTimestamp?: number;
}

// Backward compatible alias
export type CartItemResponseModel = CartItemModel;
