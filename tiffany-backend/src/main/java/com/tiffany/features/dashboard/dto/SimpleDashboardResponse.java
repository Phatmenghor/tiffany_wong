package com.tiffany.features.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimpleDashboardResponse {
    // Key Metrics
    private BigDecimal totalRevenue;
    private Integer totalOrders;
    private Integer pendingOrders;
    private Integer completedOrders;
    private Integer totalCustomers;
    private Integer newCustomersThisMonth;
    private Integer totalProducts;
    private Integer activeProducts;

    // Payment Status
    private Integer paidOrders;
    private Integer unpaidOrders;
    private BigDecimal totalPaid;
    private BigDecimal totalUnpaid;

    // Quick Stats
    private Double fulfillmentRate;
    private Double paymentRate;
    private BigDecimal averageOrderValue;
}
