package com.tiffany.features.order.dto.request;

import com.tiffany.enums.order.OrderStatus;
import com.tiffany.features.order.enums.OrderFromEnum;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateRequest {

    // Delivery info - use ID to fetch full address from database
    @NotNull(message = "Address ID is required")
    private UUID addressId;

    private DeliveryOptionRequest deliveryOption;

    // Customer info
    private String customerName;
    private String customerPhone;
    private String customerEmail;

    // Cart summary - complete cart data from frontend (can be edited locally before submit)
    private CartSummaryRequest cart;

    private String customerNote;

    @NotNull(message = "Order source (orderFrom) is required - CUSTOMER or BUSINESS")
    private OrderFromEnum orderFrom;

    private OrderStatus orderStatus = OrderStatus.PENDING;
}
