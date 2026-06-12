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
        log.info("Dashboard summary request: period={}", period);
        DashboardSummaryResponse data = dashboardService.getSummary(period);
        log.info("Dashboard summary: todaySales={}, todayOrders={}, pending={}",
                data.getTotalSalesToday(), data.getTotalOrdersToday(), data.getSystemAlerts());
        return ResponseEntity.ok(ApiResponse.success("OK", data));
    }

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<DashboardSalesResponse>> getSales(
            @RequestParam(defaultValue = "30D") String period) {
        log.info("Dashboard sales request: period={}", period);
        DashboardSalesResponse data = dashboardService.getSales(period);
        log.info("Dashboard sales: period={}, totalRevenue={}, totalOrders={}",
                period, data.getTotalRevenue(), data.getTotalOrders());
        return ResponseEntity.ok(ApiResponse.success("OK", data));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<DashboardPaymentsResponse>> getPayments(
            @RequestParam(defaultValue = "30D") String period) {
        log.info("Dashboard payments request: period={}", period);
        DashboardPaymentsResponse data = dashboardService.getPayments(period);
        log.info("Dashboard payments: period={}, totalAmount={}, totalCount={}",
                period, data.getTotalAmount(), data.getTotalCount());
        return ResponseEntity.ok(ApiResponse.success("OK", data));
    }

    @GetMapping("/hourly-sales")
    public ResponseEntity<ApiResponse<DashboardHourlySalesResponse>> getHourlySales(
            @RequestParam(defaultValue = "TODAY") String period) {
        log.info("Dashboard hourly-sales request: period={}", period);
        DashboardHourlySalesResponse data = dashboardService.getHourlySales(period);
        log.info("Dashboard hourly-sales: peakHour={}, currentHour={}", data.getPeakHour(), data.getCurrentHour());
        return ResponseEntity.ok(ApiResponse.success("OK", data));
    }
}
