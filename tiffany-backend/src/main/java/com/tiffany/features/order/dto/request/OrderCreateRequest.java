package com.tiffany.features.order.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tiffany.enums.order.OrderStatus;
import com.tiffany.enums.payment.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateRequest {

    @NotNull(message = "Address ID is required")
    private UUID addressId;

    @NotNull(message = "Customer name is required")
    private String customerName;

    @NotNull(message = "Customer phone is required")
    private String customerPhone;

    private String customerNote;
    private OrderStatus orderStatus = OrderStatus.PENDING;

    @JsonProperty("PaymentBy")
    @NotNull(message = "Payment method is required")
    private PaymentMethod PaymentBy = PaymentMethod.CASH;
}
