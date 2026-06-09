package com.tiffany.features.dashboard.controller;

import com.tiffany.features.dashboard.dto.*;
import com.tiffany.features.dashboard.service.DashboardV2Service;
import com.tiffany.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard/v2")
@RequiredArgsConstructor
@Slf4j
public class DashboardV2Controller {

    private final DashboardV2Service dashboardV2Service;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary(
            @RequestParam(defaultValue = "TODAY") String period) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardV2Service.getSummary(period)));
    }

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<DashboardSalesResponse>> getSales(
            @RequestParam(defaultValue = "7D") String period) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardV2Service.getSales(period)));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<DashboardPaymentsResponse>> getPayments(
            @RequestParam(defaultValue = "TODAY") String period) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardV2Service.getPayments(period)));
    }

    @GetMapping("/stock")
    public ResponseEntity<ApiResponse<DashboardStockResponse>> getStock() {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardV2Service.getStock()));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<DashboardOrdersResponse>> getRecentOrders(
            @RequestParam(defaultValue = "TODAY") String period) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardV2Service.getRecentOrders(period)));
    }

    @GetMapping("/top-products")
    public ResponseEntity<ApiResponse<DashboardTopProductsResponse>> getTopProducts(
            @RequestParam(defaultValue = "TODAY") String period) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardV2Service.getTopProducts(period)));
    }

    @GetMapping("/hourly-sales")
    public ResponseEntity<ApiResponse<DashboardHourlySalesResponse>> getHourlySales(
            @RequestParam(defaultValue = "TODAY") String period) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardV2Service.getHourlySales(period)));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<DashboardCustomerStatsResponse>> getCustomerStats(
            @RequestParam(defaultValue = "TODAY") String period) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardV2Service.getCustomerStats(period)));
    }

    @GetMapping("/promotions")
    public ResponseEntity<ApiResponse<DashboardPromotionsResponse>> getPromotions(
            @RequestParam(defaultValue = "TODAY") String period) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardV2Service.getPromotions(period)));
    }
}
