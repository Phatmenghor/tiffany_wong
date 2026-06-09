package com.tiffany.features.main.dto.response;

import com.tiffany.enums.product.ProductStatus;
import com.tiffany.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class ProductDetailDto extends BaseAuditResponse {
    private String name;
    private String description;
    private ProductStatus status;

    private BigDecimal price;
    private String promotionType;
    private BigDecimal promotionValue;
    private LocalDate promotionFromDate;
    private LocalDate promotionToDate;

    private BigDecimal displayPrice;
    private BigDecimal displayOriginPrice;
    private String displayPromotionType;
    private BigDecimal displayPromotionValue;
    private LocalDate displayPromotionFromDate;
    private LocalDate displayPromotionToDate;

    private Boolean hasSizes;
    private Boolean hasPromotion;
    private String mainImageUrl;

    private String barcode;
    private String sku;

    private Long viewCount;
    private Long favoriteCount;
    private Boolean isFavorited;

    private UUID categoryId;
    private String categoryName;

    private List<ProductImageDto> images;
    private List<ProductSizeDto> sizes;
}