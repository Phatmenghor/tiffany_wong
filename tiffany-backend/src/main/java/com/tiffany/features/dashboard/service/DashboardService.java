package com.tiffany.features.dashboard.service;

import com.tiffany.features.dashboard.dto.*;

public interface DashboardService {
    DashboardSummaryResponse getSummary(String period);
    DashboardSalesResponse getSales(String period);
    DashboardPaymentsResponse getPayments(String period);
    DashboardOrdersResponse getRecentOrders(String period);
    DashboardTopProductsResponse getTopProducts(String period);
    DashboardHourlySalesResponse getHourlySales(String period);
    DashboardCustomerStatsResponse getCustomerStats(String period);
    DashboardPromotionsResponse getPromotions(String period);
}
