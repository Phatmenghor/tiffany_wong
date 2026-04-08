package com.emenu.features.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusHistoryResponse {
    private UUID id;
    private String statusName;
    private String statusDescription;
    private String note;

    // User who changed the status
    private UUID changedByUserId;
    private String changedByUserName;

    private LocalDateTime changedAt;
}
