"use client";

import { useCallback, useEffect } from "react";
import { format } from "date-fns";
import { showToast } from "@/components/shared/common/show-toast";
import { useDashboardState } from "@/redux/features/dashboard/store/state/dashboard-state";
import { resetDashboard } from "@/redux/features/dashboard/store/slice/dashboard-slice";
import {
  fetchDashboardSummaryThunk,
  fetchDashboardSalesThunk,
  fetchDashboardPaymentsThunk,
  fetchDashboardHourlySalesThunk,
} from "@/redux/features/dashboard/store/thunks/dashboard-thunks";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartSkeleton } from "./_components/chart-skeleton";
import { DashboardHeader } from "./_components/dashboard-header";
import { KpiSection, KpiSectionSkeleton } from "./_components/kpi-section";

const SalesAnalyticsCard = dynamic(
  () => import("./_components/sales-analytics-card").then((m) => m.SalesAnalyticsCard),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const PaymentMethodsCard = dynamic(
  () => import("./_components/payment-methods-card").then((m) => m.PaymentMethodsCard),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const HourlySalesCard = dynamic(
  () => import("./_components/hourly-sales-card").then((m) => m.HourlySalesCard),
  { ssr: false, loading: () => <ChartSkeleton height={200} /> }
);

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
      <KpiSectionSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2"><CardContent className="p-4"><ChartSkeleton /></CardContent></Card>
        <Card><CardContent className="p-4"><ChartSkeleton height={240} /></CardContent></Card>
      </div>
      <Card><CardContent className="p-4"><ChartSkeleton height={200} /></CardContent></Card>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { summary, sales, payments, hourlySales, loading, error, dispatch } = useDashboardState();

  useEffect(() => {
    return () => { dispatch(resetDashboard()); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAll = useCallback(() => {
    dispatch(fetchDashboardSummaryThunk());
    dispatch(fetchDashboardSalesThunk());
    dispatch(fetchDashboardPaymentsThunk());
    dispatch(fetchDashboardHourlySalesThunk());
  }, [dispatch]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (error) showToast.error(error);
  }, [error]);

  const isInitialLoading = loading.summary && loading.sales && loading.payments && loading.hourlySales;

  if (isInitialLoading) return <DashboardSkeleton />;

  const today = format(new Date(), "EEEE, MMM d yyyy");
  const currentHour = hourlySales?.currentHour ?? new Date().getHours();

  return (
    <div className="flex flex-col gap-4 p-4">
      <DashboardHeader today={today} onRefresh={fetchAll} />
      <KpiSection summary={summary} loading={loading.summary} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <SalesAnalyticsCard sales={sales} loading={loading.sales} />
        <PaymentMethodsCard payments={payments} loading={loading.payments} />
      </div>
      <HourlySalesCard hourlySales={hourlySales} loading={loading.hourlySales} currentHour={currentHour} />
    </div>
  );
}
