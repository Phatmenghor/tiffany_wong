package com.tiffany.features.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderMetricsResponse {

    // Key Metrics
    private Integer totalOrders;
    private Integer pendingOrders;
    private Integer confirmedOrders;
    private Integer completedOrders;
    private Integer cancelledOrders;
    private Double fulfillmentRate;

    // Orders by Status
    private List<OrderStatusDTO> ordersByStatus;

    // Recent Orders
    private List<RecentOrderDTO> recentOrders;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderStatusDTO {
        private String status;
        private Integer count;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentOrderDTO {
        private String orderId;
        private String orderNumber;
        private String customerName;
        private BigDecimal totalAmount;
        private String orderStatus;
        private String paymentStatus;
        private LocalDateTime createdAt;
    }
}
