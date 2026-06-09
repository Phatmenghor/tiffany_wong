package com.tiffany.features.order.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class OrderItemResponse {
    private UUID id;
    private UUID productId;
    private String productName;
    private String productImageUrl;
    private UUID productSizeId;
    private String sizeName;

    private Integer quantity;

    // Display fields for UI rendering
    private BigDecimal displayPrice;           // Final price after discount
    private BigDecimal displayOriginPrice;     // Original price before discount

    // Promotion details
    private String displayPromotionType;       // PERCENTAGE or FIXED_AMOUNT
    private BigDecimal displayPromotionValue;  // Discount amount or percentage
    private LocalDate displayPromotionFromDate;
    private LocalDate displayPromotionToDate;
    private Boolean hasActivePromotion;

    // Subtotal calculations
    private BigDecimal subtotalBeforeDiscount;
    private BigDecimal subtotalDiscountAmount;
    private BigDecimal subtotalAfterDiscount;
}
