package com.tiffany.features.dashboard.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardHourlySalesResponse {
    private List<HourlySalesPoint> data;
    private int peakHour;
    private int currentHour;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class HourlySalesPoint {
        private int        hour;
        private BigDecimal revenue;
        private long       orders;
    }
}
