package com.tiffany.features.order.dto.request;

import com.tiffany.enums.order.OrderStatus;
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

    private DeliveryOptionRequest deliveryOption;
    private String customerNote;
    private OrderStatus orderStatus = OrderStatus.PENDING;
}
