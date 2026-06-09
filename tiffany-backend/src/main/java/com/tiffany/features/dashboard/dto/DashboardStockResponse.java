package com.tiffany.features.dashboard.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardStockResponse {
    private List<DashboardStockItem> data;
    private long lowStockCount;
    private long outOfStockCount;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DashboardStockItem {
        private UUID   id;
        private String name;
        private String sku;
        private int    quantity;
        private int    minStock;
        private String status;
        private String category;
        private String imageUrl;
    }
}
