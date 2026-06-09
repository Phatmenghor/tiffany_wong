package com.tiffany.features.dashboard.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardSummaryResponse {
    private BigDecimal totalSalesToday;
    private long      totalOrdersToday;
    private double    totalSalesChange;
    private double    totalOrdersChange;
    private long      lowStockItems;
    private long      systemAlerts;
    private long      activeStaff;
    private BigDecimal avgOrderValue;
}
