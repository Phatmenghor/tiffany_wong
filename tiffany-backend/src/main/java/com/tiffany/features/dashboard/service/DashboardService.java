package com.tiffany.features.dashboard.service;

import com.tiffany.features.dashboard.dto.*;

public interface DashboardService {
    DashboardSummaryResponse getSummary(String period);
    DashboardSalesResponse getSales(String period);
    DashboardPaymentsResponse getPayments(String period);
    DashboardHourlySalesResponse getHourlySales(String period);
}
