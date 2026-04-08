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

    private BigDecimal currentPriceBeforeDiscount;
    private BigDecimal currentPriceAfterDiscount;
    private BigDecimal discountAmountPerItem;
    private String discountType;
    private BigDecimal discountPercentage;
    private Boolean hasDiscount;

    private BigDecimal subtotalBeforeDiscount;
    private BigDecimal subtotalDiscountAmount;
    private BigDecimal subtotalAfterDiscount;
}