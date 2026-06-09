"use client";

import { useCallback, useEffect } from "react";
import { format } from "date-fns";
import { showToast } from "@/components/shared/common/show-toast";
import { useDashboardState } from "@/redux/features/dashboard/store/state/dashboard-state";
import { setPeriod, resetDashboard } from "@/redux/features/dashboard/store/slice/dashboard-slice";
import {
  fetchDashboardSummaryThunk,
  fetchDashboardSalesThunk,
  fetchDashboardPaymentsThunk,
  fetchDashboardStockThunk,
  fetchDashboardOrdersThunk,
  fetchDashboardTopProductsThunk,
  fetchDashboardHourlySalesThunk,
  fetchDashboardCustomerStatsThunk,
  fetchDashboardPromotionsThunk,
} from "@/redux/features/dashboard/store/thunks/dashboard-thunks";
import type { DashboardPeriod } from "@/redux/features/dashboard/store/models/response/dashboard-response";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "./_components/chart-skeleton";
import { DashboardHeader } from "./_components/dashboard-header";
import { KpiSection } from "./_components/kpi-section";
import { CustomerStatsCard } from "./_components/customer-stats-card";
import { PromotionPerformanceCard } from "./_components/promotion-performance-card";
import { RecentOrdersCard } from "./_components/recent-orders-card";
import { InventoryStatusCard } from "./_components/inventory-status-card";

const SalesAnalyticsCard = dynamic(
  () => import("./_components/sales-analytics-card").then((m) => m.SalesAnalyticsCard),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const PaymentMethodsCard = dynamic(
  () => import("./_components/payment-methods-card").then((m) => m.PaymentMethodsCard),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const TopProductsCard = dynamic(
  () => import("./_components/top-products-card").then((m) => m.TopProductsCard),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const HourlySalesCard = dynamic(
  () => import("./_components/hourly-sales-card").then((m) => m.HourlySalesCard),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export default function AdminDashboardPage() {
  const { period, summary, sales, payments, stock, orders, topProducts, hourlySales, customerStats, promotions, loading, error, dispatch } = useDashboardState();

  useEffect(() => {
    return () => { dispatch(resetDashboard()); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAll = useCallback((p: DashboardPeriod) => {
    dispatch(fetchDashboardSummaryThunk({ period: p }));
    dispatch(fetchDashboardSalesThunk({ period: "7D" }));
    dispatch(fetchDashboardPaymentsThunk({ period: p }));
    dispatch(fetchDashboardStockThunk());
    dispatch(fetchDashboardOrdersThunk({ period: p }));
    dispatch(fetchDashboardTopProductsThunk({ period: p }));
    dispatch(fetchDashboardHourlySalesThunk({ period: "TODAY" }));
    dispatch(fetchDashboardCustomerStatsThunk({ period: p }));
    dispatch(fetchDashboardPromotionsThunk({ period: "TODAY" }));
  }, [dispatch]);

  useEffect(() => {
    fetchAll(period);
  }, [period, fetchAll]);

  useEffect(() => {
    if (error) showToast.error(error);
  }, [error]);

  const today = format(new Date(), "EEEE, MMM d yyyy");
  const currentHour = hourlySales?.currentHour ?? new Date().getHours();

  return (
    <div className="flex flex-col gap-4 p-4">
      <DashboardHeader
        today={today}
        period={period}
        onPeriodChange={(p) => dispatch(setPeriod(p))}
        onRefresh={() => fetchAll(period)}
      />
      <KpiSection summary={summary} customerStats={customerStats} loading={loading} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <SalesAnalyticsCard sales={sales} loading={loading.sales} />
        <PaymentMethodsCard payments={payments} loading={loading.payments} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <TopProductsCard topProducts={topProducts} loading={loading.topProducts} />
        <div className="flex flex-col gap-3">
          <CustomerStatsCard customerStats={customerStats} loading={loading.customerStats} />
        </div>
      </div>
      <HourlySalesCard hourlySales={hourlySales} loading={loading.hourlySales} currentHour={currentHour} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <PromotionPerformanceCard promotions={promotions} loading={loading.promotions} />
        <RecentOrdersCard orders={orders} loading={loading.orders} />
      </div>
      <InventoryStatusCard stock={stock} loading={loading.stock} />
    </div>
  );
}
