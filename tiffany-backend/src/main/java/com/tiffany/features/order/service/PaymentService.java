package com.tiffany.features.order.service;

import com.tiffany.features.order.dto.filter.PaymentFilterRequest;
import com.tiffany.features.order.dto.request.PaymentCreateRequest;
import com.tiffany.features.order.dto.response.PaymentResponse;
import com.tiffany.features.order.dto.update.PaymentUpdateRequest;
import com.tiffany.shared.dto.PaginationResponse;

import java.util.UUID;

public interface PaymentService {
    PaymentResponse createPayment(PaymentCreateRequest request);

    PaginationResponse<PaymentResponse> getAllPayments(PaymentFilterRequest filter);
    PaymentResponse getPaymentById(UUID id);
    PaymentResponse updatePayment(UUID id, PaymentUpdateRequest request);
    PaymentResponse deletePayment(UUID id);
}