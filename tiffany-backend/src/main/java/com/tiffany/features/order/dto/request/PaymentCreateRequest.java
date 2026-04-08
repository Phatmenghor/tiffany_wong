package com.tiffany.features.order.dto.request;

import com.tiffany.enums.payment.PaymentMethod;
import com.tiffany.enums.payment.PaymentStatus;
import com.tiffany.enums.payment.PaymentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PaymentCreateRequest {

    private String imageUrl;
    private UUID subscriptionId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", message = "Amount must be non-negative")
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private PaymentStatus status = PaymentStatus.PENDING;
    private String referenceNumber;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;

    @NotNull(message = "Payment Type is required")
    private PaymentType paymentType = PaymentType.OTHER;
}