package com.tiffany.features.order.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class OrderItemUpdateRequest {
    private UUID productId;
    private UUID productSizeId;
    private String productName;
    private String productImageUrl;
    private String sizeName;

    private BigDecimal currentPrice;
    private BigDecimal finalPrice;
    private BigDecimal unitPrice;
    private Boolean hasPromotion;

    private String promotionType;
    private BigDecimal promotionValue;
    private LocalDate promotionFromDate;
    private LocalDate promotionToDate;

    private Integer quantity;
}
