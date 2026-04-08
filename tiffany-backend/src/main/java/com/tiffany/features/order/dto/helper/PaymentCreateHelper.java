package com.tiffany.features.order.dto.helper;

import com.tiffany.enums.payment.PaymentMethod;
import com.tiffany.enums.payment.PaymentStatus;
import com.tiffany.enums.payment.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Helper DTO for creating Payment via MapStruct
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCreateHelper {
    private UUID businessId;
    private UUID planId;
    private UUID subscriptionId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private PaymentType paymentType;
    private PaymentStatus status;
    private String notes;
}
