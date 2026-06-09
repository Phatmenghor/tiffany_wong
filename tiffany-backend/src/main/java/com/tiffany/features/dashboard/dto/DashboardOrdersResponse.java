package com.tiffany.features.dashboard.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardOrdersResponse {
    private List<DashboardOrderItem> data;
    private long totalElements;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DashboardOrderItem {
        private UUID       id;
        private String     orderCode;
        private String     customerName;
        private BigDecimal totalAmount;
        private String     status;
        private String     paymentMethod;
        private int        itemCount;
        private String     createdAt;
    }
}
