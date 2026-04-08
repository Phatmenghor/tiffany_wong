package com.tiffany.features.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
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
    private String sku;

    private Integer quantity;

    private BigDecimal basePrice;
    private BigDecimal finalPrice;
    private BigDecimal itemDiscountAmount;
    private String discountType;
    private BigDecimal discountPercent;
    private Boolean hasDiscount;

    private BigDecimal totalBeforeDiscount;
    private BigDecimal totalDiscountAmount;
    private BigDecimal totalPrice;
}