package com.tiffany.features.main.mapper;

import com.tiffany.enums.product.PromotionType;
import com.tiffany.features.main.dto.request.ProductCreateDto;
import com.tiffany.features.main.dto.response.ProductDetailDto;
import com.tiffany.features.main.dto.response.ProductListDto;
import com.tiffany.features.main.dto.update.ProductUpdateDto;
import com.tiffany.features.main.models.Product;
import com.tiffany.shared.dto.PaginationResponse;
import com.tiffany.shared.mapper.PaginationMapper;
import org.mapstruct.*;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring",
uses = {ProductImageMapper.class, ProductSizeMapper.class, PaginationMapper.class},
unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductMapper {

    @Mapping(target = "viewCount", constant = "0L")
    @Mapping(target = "favoriteCount", constant = "0L")
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "sizes", ignore = true)
    @Mapping(source = "promotionType", target = "promotionType", qualifiedByName = "stringToPromotionType")
    Product toEntity(ProductCreateDto dto);


    @AfterMapping
    default void truncateProductPromotionDates(ProductCreateDto dto, @MappingTarget Product entity) {
        // Keep full datetime including time for precise promotion scheduling
        // No truncation - preserve the exact datetime set by user
    }

    @AfterMapping
    default void afterUpdate(ProductUpdateDto dto, @MappingTarget Product entity) {
        if (!dto.hasPromotionData()) {
            entity.setPromotionType(null);
            entity.setPromotionValue(null);
            entity.setPromotionFromDate(null);
            entity.setPromotionToDate(null);
        }
        // Keep full datetime including time for precise promotion scheduling
    }

    @Mapping(target = "viewCount", ignore = true)
    @Mapping(target = "favoriteCount", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "sizes", ignore = true)
    @Mapping(source = "promotionType", target = "promotionType", qualifiedByName = "stringToPromotionType")
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(ProductUpdateDto dto, @MappingTarget Product entity);

    @Named("truncateToDay")
    default LocalDateTime truncateToDay(LocalDateTime dt) {
        return dt != null ? dt.truncatedTo(ChronoUnit.DAYS) : null;
    }

    @Mapping(target = "isFavorited", constant = "false")
    @Mapping(target = "displayPrice", ignore = true)
    @Mapping(target = "displayOriginPrice", ignore = true)
    @Mapping(target = "displayPromotionType", ignore = true)
    @Mapping(target = "displayPromotionValue", ignore = true)
    @Mapping(target = "displayPromotionFromDate", ignore = true)
    @Mapping(target = "displayPromotionToDate", ignore = true)
    @Mapping(target = "hasSizes", ignore = true)
    @Mapping(target = "hasActivePromotion", ignore = true)
    ProductListDto toListDto(Product product);

    @AfterMapping
    default void calculateListDtoDisplayFields(Product product, @MappingTarget ProductListDto dto) {
        boolean hasSizes = product.getSizes() != null && !product.getSizes().isEmpty();
        dto.setHasSizes(hasSizes);

        if (hasSizes) {
            // When product has sizes, clear product-level promotion fields
            // (price is not in ListDto but we set hasSizes)
            calculateDisplayFieldsFromSizes(product, dto);
            dto.setHasActivePromotion(hasActivePromotionInSizes(product));
        } else {
            calculateDisplayFields(product, dto);
        }
    }

    List<ProductListDto> toListDtos(List<Product> products);

    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "promotionType", target = "promotionType", qualifiedByName = "promotionTypeToString")
    @Mapping(target = "hasPromotion", ignore = true)
    @Mapping(target = "isFavorited", constant = "false")
    @Mapping(target = "images", source = "images")
    @Mapping(target = "sizes", source = "sizes")
    @Mapping(target = "displayPrice", ignore = true)
    @Mapping(target = "displayOriginPrice", ignore = true)
    @Mapping(target = "displayPromotionType", ignore = true)
    @Mapping(target = "displayPromotionValue", ignore = true)
    @Mapping(target = "displayPromotionFromDate", ignore = true)
    @Mapping(target = "displayPromotionToDate", ignore = true)
    ProductDetailDto toDetailDto(Product product);

    @AfterMapping
    default void calculateDetailDtoFields(Product product, @MappingTarget ProductDetailDto dto) {
        boolean hasSizes = product.getSizes() != null && !product.getSizes().isEmpty();
        dto.setHasSizes(hasSizes);

        if (hasSizes) {
            // When product has sizes, clear product-level promotion fields
            dto.setPrice(null);
            dto.setPromotionType(null);
            dto.setPromotionValue(null);
            dto.setPromotionFromDate(null);
            dto.setPromotionToDate(null);

            // Calculate display fields from sizes
            calculateDisplayFieldsFromSizes(product, dto);
            dto.setHasPromotion(hasActivePromotionInSizes(product));
        } else {
            // When product doesn't have sizes, use product-level fields
            calculateDisplayFields(product, dto);
            dto.setHasPromotion(isPromotionActive(product));
        }
    }

    List<ProductDetailDto> toDetailDtos(List<Product> products);

    @Named("stringToPromotionType")
    default PromotionType stringToPromotionType(String promotionType) {
if (promotionType == null || promotionType.trim().isEmpty()) {
    return null;
}
try {
    return PromotionType.valueOf(promotionType.toUpperCase());
} catch (IllegalArgumentException e) {
    return null;
}
    }

    @Named("promotionTypeToString")
    default String promotionTypeToString(PromotionType promotionType) {
return promotionType != null ? promotionType.name() : null;
    }

    /**
     * Calculate display fields for list DTO
     */
    default void calculateDisplayFields(Product product, ProductListDto dto) {
        // For now, we only handle products without sizes
        // Products with sizes would need to calculate from their ProductSize collection
        dto.setHasSizes(product.getSizes() != null && !product.getSizes().isEmpty());
        dto.setDisplayOriginPrice(product.getPrice());
        if (isPromotionActive(product)) {
            dto.setDisplayPrice(getFinalPrice(product));
            dto.setDisplayPromotionType(promotionTypeToString(product.getPromotionType()));
            dto.setDisplayPromotionValue(product.getPromotionValue());
            dto.setDisplayPromotionFromDate(product.getPromotionFromDate());
            dto.setDisplayPromotionToDate(product.getPromotionToDate());
            dto.setHasActivePromotion(true);
        } else {
            dto.setDisplayPrice(product.getPrice() != null ? product.getPrice() : java.math.BigDecimal.ZERO);
            dto.setDisplayPromotionType(null);
            dto.setDisplayPromotionValue(null);
            dto.setDisplayPromotionFromDate(null);
            dto.setDisplayPromotionToDate(null);
            dto.setHasActivePromotion(false);
        }
    }

    /**
     * Calculate display fields for detail DTO
     */
    default void calculateDisplayFields(Product product, ProductDetailDto dto) {
        // Calculate display fields - use product's own fields since we removed the entity fields
        dto.setDisplayOriginPrice(product.getPrice());
        if (isPromotionActive(product)) {
            dto.setDisplayPrice(getFinalPrice(product));
            dto.setDisplayPromotionType(promotionTypeToString(product.getPromotionType()));
            dto.setDisplayPromotionValue(product.getPromotionValue());
            dto.setDisplayPromotionFromDate(product.getPromotionFromDate());
            dto.setDisplayPromotionToDate(product.getPromotionToDate());
        } else {
            dto.setDisplayPrice(product.getPrice() != null ? product.getPrice() : java.math.BigDecimal.ZERO);
            dto.setDisplayPromotionType(null);
            dto.setDisplayPromotionValue(null);
            dto.setDisplayPromotionFromDate(null);
            dto.setDisplayPromotionToDate(null);
        }
    }

    /**
     * Calculate display fields for products with sizes (DetailDto version)
     * Uses size with active promotion if any, otherwise uses cheapest size
     */
    default void calculateDisplayFieldsFromSizes(Product product, ProductDetailDto dto) {
        if (product.getSizes() == null || product.getSizes().isEmpty()) {
            dto.setDisplayPrice(java.math.BigDecimal.ZERO);
            dto.setDisplayOriginPrice(java.math.BigDecimal.ZERO);
            return;
        }

        // Find size with active promotion
        var sizeWithPromotion = product.getSizes().stream()
                .filter(this::isSizePromotionActive)
                .findFirst();

        if (sizeWithPromotion.isPresent()) {
            var size = sizeWithPromotion.get();
            dto.setDisplayOriginPrice(size.getPrice());
            dto.setDisplayPrice(getSizeFinalPrice(size));
            dto.setDisplayPromotionType(promotionTypeToString(size.getPromotionType()));
            dto.setDisplayPromotionValue(size.getPromotionValue());
            dto.setDisplayPromotionFromDate(size.getPromotionFromDate());
            dto.setDisplayPromotionToDate(size.getPromotionToDate());
        } else {
            // Use cheapest size
            var cheapestSize = product.getSizes().stream()
                    .min(java.util.Comparator.comparing(com.tiffany.features.main.models.ProductSize::getPrice))
                    .orElse(product.getSizes().get(0));

            dto.setDisplayOriginPrice(cheapestSize.getPrice());
            dto.setDisplayPrice(cheapestSize.getPrice());
            dto.setDisplayPromotionType(null);
            dto.setDisplayPromotionValue(null);
            dto.setDisplayPromotionFromDate(null);
            dto.setDisplayPromotionToDate(null);
        }
    }

    /**
     * Calculate display fields for products with sizes (ListDto version)
     * Uses size with active promotion if any, otherwise uses cheapest size
     */
    default void calculateDisplayFieldsFromSizes(Product product, ProductListDto dto) {
        if (product.getSizes() == null || product.getSizes().isEmpty()) {
            dto.setDisplayPrice(java.math.BigDecimal.ZERO);
            dto.setDisplayOriginPrice(java.math.BigDecimal.ZERO);
            return;
        }

        // Find size with active promotion
        var sizeWithPromotion = product.getSizes().stream()
                .filter(this::isSizePromotionActive)
                .findFirst();

        if (sizeWithPromotion.isPresent()) {
            var size = sizeWithPromotion.get();
            dto.setDisplayOriginPrice(size.getPrice());
            dto.setDisplayPrice(getSizeFinalPrice(size));
            dto.setDisplayPromotionType(promotionTypeToString(size.getPromotionType()));
            dto.setDisplayPromotionValue(size.getPromotionValue());
            dto.setDisplayPromotionFromDate(size.getPromotionFromDate());
            dto.setDisplayPromotionToDate(size.getPromotionToDate());
        } else {
            // Use cheapest size
            var cheapestSize = product.getSizes().stream()
                    .min(java.util.Comparator.comparing(com.tiffany.features.main.models.ProductSize::getPrice))
                    .orElse(product.getSizes().get(0));

            dto.setDisplayOriginPrice(cheapestSize.getPrice());
            dto.setDisplayPrice(cheapestSize.getPrice());
            dto.setDisplayPromotionType(null);
            dto.setDisplayPromotionValue(null);
            dto.setDisplayPromotionFromDate(null);
            dto.setDisplayPromotionToDate(null);
        }
    }

    /**
     * Check if any size in product has active promotion
     */
    default boolean hasActivePromotionInSizes(Product product) {
        if (product.getSizes() == null) {
            return false;
        }
        return product.getSizes().stream().anyMatch(this::isSizePromotionActive);
    }

    /**
     * Check if a size promotion is active
     * Checks against exact datetime (including time)
     */
    default boolean isSizePromotionActive(com.tiffany.features.main.models.ProductSize size) {
        if (size.getPromotionValue() == null || size.getPromotionType() == null) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();

        if (size.getPromotionFromDate() != null && now.isBefore(size.getPromotionFromDate())) {
            return false;
        }

        if (size.getPromotionToDate() != null && now.isAfter(size.getPromotionToDate())) {
            return false;
        }

        return true;
    }

    /**
     * Calculate final price for a size based on its promotion
     */
    default java.math.BigDecimal getSizeFinalPrice(com.tiffany.features.main.models.ProductSize size) {
        if (!isSizePromotionActive(size)) {
            return size.getPrice() != null ? size.getPrice() : java.math.BigDecimal.ZERO;
        }

        java.math.BigDecimal basePrice = size.getPrice() != null ? size.getPrice() : java.math.BigDecimal.ZERO;

        switch (size.getPromotionType()) {
            case PERCENTAGE -> {
                java.math.BigDecimal discount = basePrice.multiply(size.getPromotionValue())
                        .divide(java.math.BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
                return basePrice.subtract(discount);
            }
            case FIXED_AMOUNT -> {
                java.math.BigDecimal finalPrice = basePrice.subtract(size.getPromotionValue());
                return finalPrice.compareTo(java.math.BigDecimal.ZERO) < 0 ? java.math.BigDecimal.ZERO : finalPrice;
            }
            default -> {
                return basePrice;
            }
        }
    }

    /**
     * Check if promotion is active
     * Checks against exact datetime (including time)
     */
    default boolean isPromotionActive(Product product) {
        if (product.getPromotionValue() == null || product.getPromotionType() == null) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();

        if (product.getPromotionFromDate() != null && now.isBefore(product.getPromotionFromDate())) {
            return false;
        }

        if (product.getPromotionToDate() != null && now.isAfter(product.getPromotionToDate())) {
            return false;
        }

        return true;
    }

    /**
     * Calculate final price based on promotion
     */
    default java.math.BigDecimal getFinalPrice(Product product) {
        if (!isPromotionActive(product)) {
            return product.getPrice() != null ? product.getPrice() : java.math.BigDecimal.ZERO;
        }

        java.math.BigDecimal basePrice = product.getPrice() != null ? product.getPrice() : java.math.BigDecimal.ZERO;

        switch (product.getPromotionType()) {
            case PERCENTAGE -> {
                java.math.BigDecimal discount = basePrice.multiply(product.getPromotionValue())
                        .divide(java.math.BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
                return basePrice.subtract(discount);
            }
            case FIXED_AMOUNT -> {
                java.math.BigDecimal finalPrice = basePrice.subtract(product.getPromotionValue());
                return finalPrice.compareTo(java.math.BigDecimal.ZERO) < 0 ? java.math.BigDecimal.ZERO : finalPrice;
            }
            default -> {
                return basePrice;
            }
        }
    }

    /**
     * Convert paginated products to pagination response
     */
    default PaginationResponse<ProductListDto> toPaginationResponse(Page<Product> page, PaginationMapper paginationMapper) {
return paginationMapper.toPaginationResponse(page, this::toListDtos);
    }
}