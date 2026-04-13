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
public class CustomerMetricsResponse {

    // Key Metrics
    private Integer totalCustomers;
    private Integer activeCustomers;
    private Integer newCustomersThisMonth;
    private BigDecimal totalCustomerValue;
    private BigDecimal averageCustomerValue;

    // Top Customers by Revenue
    private List<TopCustomerDTO> topCustomers;

    // New Customers This Month
    private List<NewCustomerDTO> newCustomers;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopCustomerDTO {
        private String customerId;
        private String customerName;
        private String email;
        private String phoneNumber;
        private Integer orderCount;
        private BigDecimal totalSpent;
        private LocalDateTime lastOrderDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NewCustomerDTO {
        private String customerId;
        private String customerName;
        private String email;
        private LocalDateTime registeredDate;
        private Integer orders;
        private BigDecimal totalSpent;
    }
}
