package com.tiffany.features.dashboard.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardCustomerStatsResponse {
    private long       newCustomers;
    private long       returningCustomers;
    private double     returnRate;
    private long       totalCustomers;
    private BigDecimal avgOrderValue;
}
