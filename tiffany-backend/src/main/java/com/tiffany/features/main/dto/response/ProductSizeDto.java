package com.tiffany.features.main.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ProductSizeDto {
    private UUID id;
    private String name;
    private BigDecimal price;
    private String promotionType;
    private BigDecimal promotionValue;
    private LocalDate promotionFromDate;
    private LocalDate promotionToDate;
    private BigDecimal finalPrice;
    private Boolean hasPromotion;

    private LocalDateTime createdAt;
}