package com.tiffany.features.order.dto.filter;

import com.tiffany.enums.order.OrderStatus;
import com.tiffany.enums.payment.PaymentMethod;
import com.tiffany.enums.payment.PaymentStatus;
import com.tiffany.shared.dto.BaseFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class OrderFilterRequest extends BaseFilterRequest {
    private OrderStatus orderStatus;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
}
