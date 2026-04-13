package com.tiffany.features.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesMetricsResponse {

    // Key Metrics Cards
    private BigDecimal totalRevenue;
    private Integer totalOrders;
    private Integer activeCustomers;
    private BigDecimal averageOrderValue;

    // Revenue Trend Data
    private List<DailyRevenueDTO> revenueTrend;

    // Orders by Status
    private List<OrderStatusCountDTO> ordersByStatus;

    // Payment Status Distribution
    private List<PaymentStatusCountDTO> paymentStatusDistribution;

    // Top Products
    private List<TopProductDTO> topProducts;

    // Sales by Payment Method
    private List<PaymentMethodDTO> salesByPaymentMethod;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyRevenueDTO {
        private LocalDate date;
        private BigDecimal revenue;
        private Integer orderCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderStatusCountDTO {
        private String status;
        private Integer count;
        private BigDecimal totalAmount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentStatusCountDTO {
        private String status;
        private Integer count;
        private BigDecimal amount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopProductDTO {
        private String productId;
        private String productName;
        private Integer quantity;
        private BigDecimal revenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentMethodDTO {
        private String method;
        private Integer count;
        private BigDecimal amount;
    }
}
