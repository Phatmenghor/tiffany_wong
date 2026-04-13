package com.tiffany.features.dashboard.service;

import com.tiffany.features.dashboard.dto.*;

public interface DashboardService {

    SalesMetricsResponse getSalesMetrics();

    OrderMetricsResponse getOrderMetrics();

    ProductMetricsResponse getProductMetrics();

    CustomerMetricsResponse getCustomerMetrics();

    PaymentMetricsResponse getPaymentMetrics();
}
