package com.tiffany.features.order.dto.update;

import com.tiffany.enums.order.OrderStatus;
import com.tiffany.enums.payment.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderUpdateRequest {
    private OrderStatus orderStatus;
    private PaymentStatus paymentStatus;
    private String customerNote;
}
