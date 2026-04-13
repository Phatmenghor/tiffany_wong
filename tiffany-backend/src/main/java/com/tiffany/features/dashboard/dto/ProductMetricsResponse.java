package com.tiffany.features.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductMetricsResponse {

    // Key Metrics
    private Integer totalProducts;
    private Integer activeProducts;
    private Integer inactiveProducts;
    private Integer productsWithPromotion;

    // Top Products by Revenue
    private List<ProductPerformanceDTO> topProductsByRevenue;

    // Top Products by Views
    private List<ProductPerformanceDTO> topProductsByViews;

    // Top Products by Favorites
    private List<ProductPerformanceDTO> topProductsByFavorites;

    // Products by Category
    private List<CategoryCountDTO> productsByCategory;

    // Products with Lowest Performance
    private List<ProductPerformanceDTO> lowestPerformanceProducts;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductPerformanceDTO {
        private String productId;
        private String productName;
        private BigDecimal price;
        private Integer quantity;
        private BigDecimal revenue;
        private Integer viewCount;
        private Integer favoriteCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryCountDTO {
        private String categoryId;
        private String categoryName;
        private Integer productCount;
        private BigDecimal revenue;
    }
}
