package com.tiffany.features.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private UUID id;

    // Product information (flattened for frontend)
    private UUID productId;
    private String productName;
    private String productImageUrl;
    private UUID productSizeId;        // null for products without sizes
    private String sizeName;           // "Standard" for products without sizes
    private String status;             // ProductStatus: ACTIVE, INACTIVE, OUT_OF_STOCK

    // SKU and barcode from product master data
    private String sku;
    private String barcode;

    // Current pricing (always real-time from product)
    private BigDecimal currentPrice;           // Base price
    private BigDecimal finalPrice;             // Price with active promotions
    private Boolean hasActivePromotion;        // Whether has active promotion

    private Integer quantity;

    // Detailed pricing breakdown (standardized across cart/checkout/order)
    private BigDecimal totalBeforeDiscount;    // currentPrice * quantity
    private BigDecimal discountAmount;         // totalBeforeDiscount - totalPrice (discount for this item)
    private BigDecimal totalPrice;             // finalPrice * quantity (final total after discount)

    // Promotion details (for display)
    private String promotionType;              // PERCENTAGE or FIXED_AMOUNT
    private BigDecimal promotionValue;
    private LocalDateTime promotionFromDate;
    private LocalDateTime promotionToDate;

    // Pricing change tracking for POS operations
    private PricingSnapshot before;            // Price snapshot before POS change
    private PricingSnapshot after;             // Price snapshot after POS change
    private Boolean hadChangeFromPOS = false;  // Whether price changed due to POS operation

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PricingSnapshot {
        private BigDecimal price;
        private BigDecimal total;
        private BigDecimal discount;
    }
}