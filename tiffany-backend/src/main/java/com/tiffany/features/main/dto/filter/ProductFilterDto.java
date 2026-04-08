package com.tiffany.features.main.dto.filter;

import com.tiffany.enums.product.ProductStatus;
import com.tiffany.shared.dto.BaseFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class ProductFilterDto extends BaseFilterRequest {
    private UUID categoryId;
    private UUID brandId;
    private List<ProductStatus> statuses;
    private Boolean hasPromotion;
    private Boolean hasSize;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
}