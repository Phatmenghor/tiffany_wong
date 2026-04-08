package com.tiffany.features.order.dto.filter;

import com.tiffany.enums.payment.PaymentMethod;
import com.tiffany.enums.payment.PaymentStatus;
import com.tiffany.shared.dto.BaseFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class OrderPaymentFilterRequest extends BaseFilterRequest {
    private List<PaymentStatus> statuses;
    private PaymentMethod paymentMethod;
    private String customerPaymentMethod;
    private LocalDateTime createdFrom;
    private LocalDateTime createdTo;
}
