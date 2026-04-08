package com.tiffany.features.order.dto.filter;

import com.tiffany.enums.payment.PaymentMethod;
import com.tiffany.enums.payment.PaymentStatus;
import com.tiffany.shared.dto.BaseFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class PaymentFilterRequest extends BaseFilterRequest {
    private List<PaymentMethod> paymentMethods;
    private List<PaymentStatus> statuses;
    private UUID planId;
    private LocalDate createdFrom;
    private LocalDate createdTo;
}