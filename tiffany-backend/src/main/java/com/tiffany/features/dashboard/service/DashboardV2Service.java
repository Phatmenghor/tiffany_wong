package com.tiffany.features.dashboard.service;

import com.tiffany.features.dashboard.dto.*;

public interface DashboardV2Service {
    DashboardSummaryResponse getSummary(String period);
    DashboardSalesResponse getSales(String period);
    DashboardPaymentsResponse getPayments(String period);
    DashboardStockResponse getStock();
    DashboardOrdersResponse getRecentOrders(String period);
    DashboardTopProductsResponse getTopProducts(String period);
    DashboardHourlySalesResponse getHourlySales(String period);
    DashboardCustomerStatsResponse getCustomerStats(String period);
    DashboardPromotionsResponse getPromotions(String period);
}
