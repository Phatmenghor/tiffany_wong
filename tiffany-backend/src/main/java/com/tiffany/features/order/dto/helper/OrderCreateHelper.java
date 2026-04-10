package com.tiffany.features.order.dto.helper;

import com.tiffany.enums.order.OrderStatus;
import com.tiffany.enums.payment.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateHelper {
    private String orderNumber;
    private UUID customerId;
    private String customerNote;
    private OrderStatus orderStatus;
    private PaymentMethod paymentMethod;

    // ===== Delivery Address Fields =====
    private BigDecimal deliveryLatitude;
    private BigDecimal deliveryLongitude;

    // ===== Delivery Option Fields =====
    private BigDecimal deliveryFee;

    // Pricing - initialized with defaults, updated after items are processed
    private BigDecimal subtotal;
    private BigDecimal totalAmount;
}
