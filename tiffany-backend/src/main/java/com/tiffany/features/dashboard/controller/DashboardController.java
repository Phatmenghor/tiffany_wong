package com.tiffany.features.dashboard.controller;

import com.tiffany.features.dashboard.dto.*;
import com.tiffany.features.dashboard.service.DashboardService;
import com.tiffany.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary(
            @RequestParam(defaultValue = "TODAY") String period) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardService.getSummary(period)));
    }

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<DashboardSalesResponse>> getSales(
            @RequestParam(defaultValue = "7D") String period) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardService.getSales(period)));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<DashboardPaymentsResponse>> getPayments(
            @RequestParam(defaultValue = "TODAY") String period) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardService.getPayments(period)));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<DashboardOrdersResponse>> getRecentOrders(
            @RequestParam(defaultValue = "TODAY") String period) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardService.getRecentOrders(period)));
    }

    @GetMapping("/top-products")
    public ResponseEntity<ApiResponse<DashboardTopProductsResponse>> getTopProducts(
            @RequestParam(defaultValue = "TODAY") String period) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardService.getTopProducts(period)));
    }

    @GetMapping("/hourly-sales")
    public ResponseEntity<ApiResponse<DashboardHourlySalesResponse>> getHourlySales(
            @RequestParam(defaultValue = "TODAY") String period) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardService.getHourlySales(period)));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<DashboardCustomerStatsResponse>> getCustomerStats(
            @RequestParam(defaultValue = "TODAY") String period) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardService.getCustomerStats(period)));
    }

    @GetMapping("/promotions")
    public ResponseEntity<ApiResponse<DashboardPromotionsResponse>> getPromotions(
            @RequestParam(defaultValue = "TODAY") String period) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardService.getPromotions(period)));
    }
}
