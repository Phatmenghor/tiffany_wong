package com.tiffany.features.dashboard.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardPaymentsResponse {
    private List<PaymentMethodData> data;
    private BigDecimal totalAmount;
    private long       totalCount;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PaymentMethodData {
        private String     method;
        private BigDecimal amount;
        private long       count;
        private double     percentage;
    }
}
