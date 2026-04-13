package com.tiffany.features.dashboard.controller;

import com.tiffany.features.dashboard.dto.*;
import com.tiffany.features.dashboard.service.DashboardService;
import com.tiffany.features.dashboard.service.SimpleDashboardService;
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
    private final SimpleDashboardService simpleDashboardService;

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<SalesMetricsResponse>> getSalesMetrics() {
        log.info("Fetching sales metrics");
        SalesMetricsResponse metrics = dashboardService.getSalesMetrics();
        return ResponseEntity.ok(ApiResponse.success("Sales metrics retrieved successfully", metrics));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<OrderMetricsResponse>> getOrderMetrics() {
        log.info("Fetching order metrics");
        OrderMetricsResponse metrics = dashboardService.getOrderMetrics();
        return ResponseEntity.ok(ApiResponse.success("Order metrics retrieved successfully", metrics));
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<ProductMetricsResponse>> getProductMetrics() {
        log.info("Fetching product metrics");
        ProductMetricsResponse metrics = dashboardService.getProductMetrics();
        return ResponseEntity.ok(ApiResponse.success("Product metrics retrieved successfully", metrics));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<CustomerMetricsResponse>> getCustomerMetrics() {
        log.info("Fetching customer metrics");
        CustomerMetricsResponse metrics = dashboardService.getCustomerMetrics();
        return ResponseEntity.ok(ApiResponse.success("Customer metrics retrieved successfully", metrics));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<PaymentMetricsResponse>> getPaymentMetrics() {
        log.info("Fetching payment metrics");
        PaymentMetricsResponse metrics = dashboardService.getPaymentMetrics();
        return ResponseEntity.ok(ApiResponse.success("Payment metrics retrieved successfully", metrics));
    }

    @GetMapping("/simple")
    public ResponseEntity<ApiResponse<SimpleDashboardResponse>> getSimpleDashboard() {
        log.info("Fetching simple dashboard metrics");
        SimpleDashboardResponse metrics = simpleDashboardService.getSimpleDashboard();
        return ResponseEntity.ok(ApiResponse.success("Dashboard metrics retrieved successfully", metrics));
    }
}
