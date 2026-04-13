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
public class DailyTrendResponse {
    private List<DailyData> dailyData;
    private String period; // e.g., "Last 30 Days"
    private int totalDays;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyData {
        private String date; // Format: yyyy-MM-dd
        private Integer ordersCount;
        private BigDecimal revenue;
        private Integer completedOrders;
        private Integer newCustomers;
        private BigDecimal totalAmount;
    }
}
