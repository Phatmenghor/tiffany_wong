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

    private BigDecimal currentPrice;
    private BigDecimal finalPrice;
    private Boolean hasActivePromotion;
    private Integer quantity;

    private BigDecimal totalBeforeDiscount;
    private BigDecimal discountAmount;
    private BigDecimal totalPrice;

    private String promotionType;
    private BigDecimal promotionValue;
}