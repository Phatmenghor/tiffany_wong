package com.tiffany.features.dashboard.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardPromotionsResponse {
    private List<DashboardPromotion> data;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DashboardPromotion {
        private String     id;
        private String     name;
        private String     type;
        private long       timesUsed;
        private BigDecimal revenueGenerated;
        private BigDecimal discountGiven;
    }
}
