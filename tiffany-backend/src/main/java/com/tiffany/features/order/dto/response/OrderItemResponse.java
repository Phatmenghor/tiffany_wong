package com.tiffany.features.order.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class OrderItemResponse {
    private UUID id;
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

    private OrderItemProductInfo product;

    @Data
    public static class OrderItemProductInfo {
        private UUID id;
        private String name;
        private String imageUrl;
        private String sku;
        private String barcode;
        private UUID sizeId;
        private String sizeName;
        private String status;
        private String promotionName;
    }
}
