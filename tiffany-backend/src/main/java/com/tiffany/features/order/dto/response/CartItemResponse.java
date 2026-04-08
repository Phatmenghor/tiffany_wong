package com.tiffany.features.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    private String status;
    private String sku;
    private String barcode;

    private BigDecimal currentPrice;
    private BigDecimal finalPrice;
    private Boolean hasActivePromotion;
    private Integer quantity;

    private BigDecimal totalBeforeDiscount;
    private BigDecimal discountAmount;
    private BigDecimal totalPrice;

    private String promotionType;
    private BigDecimal promotionValue;
    private LocalDateTime promotionFromDate;
    private LocalDateTime promotionToDate;

    private PricingSnapshot before;
    private PricingSnapshot after;
    private Boolean hadChangeFromPOS = false;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PricingSnapshot {
        private BigDecimal price;
        private BigDecimal total;
        private BigDecimal discount;
        private BigDecimal finalPrice;
        private BigDecimal currentPrice;
        private Boolean hasActivePromotion;
        private String promotionType;
        private BigDecimal promotionValue;
    }
}