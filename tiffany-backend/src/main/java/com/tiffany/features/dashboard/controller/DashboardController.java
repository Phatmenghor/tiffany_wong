package com.tiffany.features.dashboard.controller;

import com.tiffany.features.dashboard.dto.*;
import com.tiffany.features.dashboard.service.DashboardService;
import com.tiffany.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<SalesMetricsResponse>> getSalesMetrics() {
        log.info("Fetching sales metrics");
        SalesMetricsResponse metrics = dashboardService.getSalesMetrics();
        return ResponseEntity.ok(ApiResponse.success(metrics, "Sales metrics retrieved successfully"));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<OrderMetricsResponse>> getOrderMetrics() {
        log.info("Fetching order metrics");
        OrderMetricsResponse metrics = dashboardService.getOrderMetrics();
        return ResponseEntity.ok(ApiResponse.success(metrics, "Order metrics retrieved successfully"));
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<ProductMetricsResponse>> getProductMetrics() {
        log.info("Fetching product metrics");
        ProductMetricsResponse metrics = dashboardService.getProductMetrics();
        return ResponseEntity.ok(ApiResponse.success(metrics, "Product metrics retrieved successfully"));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<CustomerMetricsResponse>> getCustomerMetrics() {
        log.info("Fetching customer metrics");
        CustomerMetricsResponse metrics = dashboardService.getCustomerMetrics();
        return ResponseEntity.ok(ApiResponse.success(metrics, "Customer metrics retrieved successfully"));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<PaymentMetricsResponse>> getPaymentMetrics() {
        log.info("Fetching payment metrics");
        PaymentMetricsResponse metrics = dashboardService.getPaymentMetrics();
        return ResponseEntity.ok(ApiResponse.success(metrics, "Payment metrics retrieved successfully"));
    }
}
