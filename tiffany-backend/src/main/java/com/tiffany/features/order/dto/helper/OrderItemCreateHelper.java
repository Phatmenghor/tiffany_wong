package com.tiffany.features.order.dto.helper;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemCreateHelper {
    private UUID orderId;
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

    private Integer quantity;
    private String sku;
    private String barcode;
}
