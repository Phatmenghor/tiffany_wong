"use client";
import { TrendingUp, TrendingDown, ShoppingCart, DollarSign, Bell, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/common/currency-format";
import { cn } from "@/lib/utils";
import type { DashboardSummaryResponse } from "@/redux/features/dashboard/store/models/response/dashboard-response";

interface KpiCardProps {
  title: string; value: string; change?: number;
  icon: React.ReactNode; iconBg: string; description?: string;
}

function KpiCard({ title, value, change, icon, iconBg, description }: KpiCardProps) {
  const isPositive = change !== undefined && change >= 0;
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-[0.4875rem]">
        <div className="flex items-center justify-between mb-[0.325rem]">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <div className={cn("h-[1.1375rem] w-[1.1375rem] rounded-[0.24375rem] flex items-center justify-center shrink-0", iconBg)}>{icon}</div>
        </div>
        <p className="text-[0.65rem] font-bold text-foreground tracking-tight tabular-nums">{value}</p>
        {change !== undefined && (
          <div className="flex items-center gap-[0.1625rem] mt-[0.1625rem]">
            {isPositive ? <TrendingUp className="h-[0.4875rem] w-[0.4875rem] text-emerald-500" /> : <TrendingDown className="h-[0.4875rem] w-[0.4875rem] text-rose-500" />}
            <span className={cn("text-[10px] font-medium", isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
              {isPositive ? "+" : ""}{change.toFixed(1)}% vs yesterday
            </span>
          </div>
        )}
        {description && change === undefined && <p className="text-[10px] text-muted-foreground mt-[0.1625rem]">{description}</p>}
      </CardContent>
    </Card>
  );
}

export function KpiSectionSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[0.4875rem]">
      {[...Array(4)].map((_, i) => (
        <Card key={i}><CardContent className="p-[0.4875rem]">
          <div className="flex items-center justify-between mb-[0.325rem]"><Skeleton className="h-[0.40625rem] w-[2.6rem]" /><Skeleton className="h-[1.1375rem] w-[1.1375rem] rounded-[0.24375rem]" /></div>
          <Skeleton className="h-[0.8125rem] w-[3.9rem] mb-[0.24375rem]" /><Skeleton className="h-[0.40625rem] w-[3.25rem]" />
        </CardContent></Card>
      ))}
    </div>
  );
}

export function KpiSection({ summary, loading }: { summary: DashboardSummaryResponse | null; loading: boolean }) {
  if (loading) return <KpiSectionSkeleton />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[0.4875rem]">
      <KpiCard title="Total Sales Today" value={formatCurrency(summary?.totalSalesToday ?? 0)} change={summary?.totalSalesChange} icon={<DollarSign className="h-[0.56875rem] w-[0.56875rem] text-primary" />} iconBg="bg-primary/10" />
      <KpiCard title="Total Orders Today" value={String(summary?.totalOrdersToday ?? 0)} change={summary?.totalOrdersChange} icon={<ShoppingCart className="h-[0.56875rem] w-[0.56875rem] text-sky-600" />} iconBg="bg-sky-100 dark:bg-sky-950/40" />
      <KpiCard title="Avg Order Value" value={formatCurrency(summary?.avgOrderValue ?? 0)} icon={<ArrowUpRight className="h-[0.56875rem] w-[0.56875rem] text-violet-600" />} iconBg="bg-violet-100 dark:bg-violet-950/40" description="Per transaction today" />
      <KpiCard title="Pending Orders" value={String(summary?.systemAlerts ?? 0)} icon={<Bell className="h-[0.56875rem] w-[0.56875rem] text-rose-600" />} iconBg="bg-rose-100 dark:bg-rose-950/40" description={summary?.systemAlerts ? "Awaiting action" : "All clear"} />
    </div>
  );
}
