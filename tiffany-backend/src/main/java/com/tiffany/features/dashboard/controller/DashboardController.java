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
            @RequestParam(defaultValue = "30D") String period) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardService.getSummary(period)));
    }

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<DashboardSalesResponse>> getSales(
            @RequestParam(defaultValue = "30D") String period) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardService.getSales(period)));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<DashboardPaymentsResponse>> getPayments(
            @RequestParam(defaultValue = "30D") String period) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardService.getPayments(period)));
    }

    @GetMapping("/hourly-sales")
    public ResponseEntity<ApiResponse<DashboardHourlySalesResponse>> getHourlySales(
            @RequestParam(defaultValue = "TODAY") String period) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardService.getHourlySales(period)));
    }
}
