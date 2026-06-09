package com.tiffany.features.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private UUID id;
    private UUID productId;
    private String productName;
    private String productImageUrl;
    private UUID productSizeId;
    private String sizeName;

    private Integer quantity;

    // Display fields for UI rendering
    private BigDecimal displayPrice;
    private BigDecimal displayOriginPrice;
    private String displayPromotionType;
    private BigDecimal displayPromotionValue;
    private LocalDate displayPromotionFromDate;
    private LocalDate displayPromotionToDate;
    private Boolean hasActivePromotion;

    // Subtotal calculations
    private BigDecimal subtotalBeforeDiscount;
    private BigDecimal subtotalDiscountAmount;
    private BigDecimal subtotalAfterDiscount;
}