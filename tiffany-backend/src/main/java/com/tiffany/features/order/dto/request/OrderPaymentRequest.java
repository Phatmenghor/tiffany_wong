package com.tiffany.features.order.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderPaymentRequest {

    private String paymentMethod;  // PaymentMethod enum as string (CASH, BANK_TRANSFER, MOBILE_MONEY, etc.)
    private String paymentStatus;  // PaymentStatus enum as string (PENDING, COMPLETED, FAILED, etc.)
}
