package com.tiffany.features.dashboard.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardSalesResponse {
    private List<SalesDataPoint> data;
    private BigDecimal totalRevenue;
    private long       totalOrders;
    private String     period;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SalesDataPoint {
        private String     date;
        private BigDecimal revenue;
        private long       orders;
    }
}
