package com.tiffany.features.order.service;

import com.tiffany.features.order.dto.filter.OrderPaymentFilterRequest;
import com.tiffany.features.order.dto.response.OrderPaymentResponse;
import com.tiffany.shared.dto.PaginationResponse;

import java.util.UUID;

public interface OrderPaymentService {
    PaginationResponse<OrderPaymentResponse> getAllPayments(OrderPaymentFilterRequest filter);
    OrderPaymentResponse getPaymentById(UUID id);
    OrderPaymentResponse getPaymentByOrderId(UUID orderId);
}
