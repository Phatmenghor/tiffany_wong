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
public class PaymentMetricsResponse {

    // Key Metrics
    private Integer totalOrders;
    private Integer paidOrders;
    private Integer unpaidOrders;
    private Integer refundedOrders;
    private BigDecimal totalRevenuePaid;
    private BigDecimal totalRevenueUnpaid;
    private BigDecimal totalRevenueRefunded;
    private Double paymentRate;

    // Payment Status Distribution
    private List<PaymentStatusDTO> paymentStatusDistribution;

    // Revenue by Payment Method
    private List<PaymentMethodRevenueDTO> revenueByPaymentMethod;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentStatusDTO {
        private String status;
        private Integer count;
        private BigDecimal amount;
        private Double percentage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentMethodRevenueDTO {
        private String method;
        private Integer count;
        private BigDecimal amount;
        private Double percentage;
    }
}
