package com.tiffany.features.order.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class OrderItemResponse {
    private UUID id;
    private Integer quantity;
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

        private BigDecimal basePrice;
        private BigDecimal discountedPrice;
        private BigDecimal discountAmount;
        private String discountType;
        private BigDecimal discountPercent;
        private Boolean hasDiscount;

        private String promotionName;
    }
}
