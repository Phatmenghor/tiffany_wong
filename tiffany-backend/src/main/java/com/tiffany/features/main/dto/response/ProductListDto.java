package com.tiffany.features.main.dto.response;

import com.tiffany.enums.product.ProductStatus;
import com.tiffany.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class ProductListDto extends BaseAuditResponse {
    private String name;
    private ProductStatus status;
    
    private BigDecimal displayPrice;
    private BigDecimal displayOriginPrice;
    private String displayPromotionType;
    private BigDecimal displayPromotionValue;
    private LocalDateTime displayPromotionFromDate;
    private LocalDateTime displayPromotionToDate;
    
    private Boolean hasSizes;
    private Boolean hasActivePromotion;
    private String mainImageUrl;
    
    private String barcode;
    private String sku;

    private Long viewCount;
    private Long favoriteCount;
    private Boolean isFavorited;

    private UUID categoryId;
}