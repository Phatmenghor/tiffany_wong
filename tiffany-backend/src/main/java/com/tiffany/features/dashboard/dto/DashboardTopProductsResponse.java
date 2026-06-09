package com.tiffany.features.dashboard.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardTopProductsResponse {
    private List<DashboardTopProduct> data;
    private String period;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DashboardTopProduct {
        private UUID       id;
        private String     name;
        private long       unitsSold;
        private BigDecimal revenue;
        private String     category;
        private String     imageUrl;
    }
}
