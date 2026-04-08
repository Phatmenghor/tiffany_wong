package com.tiffany.features.order.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class OrderItemUpdateRequest {
    private UUID productId;
    private UUID productSizeId;
    private String productName;
    private String productImageUrl;
    private String sizeName;

    private String sku;
    private String barcode;

    private BigDecimal currentPrice;
    private BigDecimal finalPrice;
    private BigDecimal unitPrice;
    private Boolean hasPromotion;

    private String promotionType;
    private BigDecimal promotionValue;
    private LocalDateTime promotionFromDate;
    private LocalDateTime promotionToDate;

    private Integer quantity;
}
