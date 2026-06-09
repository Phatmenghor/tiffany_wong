"use client";
import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DashboardStockResponse, StockStatus } from "@/redux/features/dashboard/store/models/response/dashboard-response";

const STATUS_STYLES: Record<StockStatus, string> = {
  IN_STOCK: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  LOW_STOCK: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  OUT_OF_STOCK: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
};

const STATUS_LABEL: Record<StockStatus, string> = {
  IN_STOCK: "In Stock",
  LOW_STOCK: "Low",
  OUT_OF_STOCK: "Out",
};

export function InventoryStatusCard({ stock, loading }: { stock: DashboardStockResponse | null; loading: boolean }) {
  const hasAlerts = (stock?.lowStockCount ?? 0) + (stock?.outOfStockCount ?? 0) > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xs">Inventory Status</CardTitle>
            <CardDescription className="text-xs">Stock levels at a glance</CardDescription>
          </div>
          {hasAlerts && (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-200 gap-1">
              <span className="w-1 h-1 rounded-full bg-amber-500 inline-block" />
              {(stock?.lowStockCount ?? 0) + (stock?.outOfStockCount ?? 0)} alerts
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-3 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-2.5 w-24" />
                  <Skeleton className="h-2 w-14" />
                </div>
                <Skeleton className="h-4 w-14 rounded-full" />
              </div>
            ))}
          </div>
        ) : !stock?.data?.length ? (
          <div className="flex flex-col items-center justify-center py-7 text-muted-foreground gap-1">
            <Package className="h-5 w-5 opacity-30" />
            <p className="text-xs">No inventory data</p>
          </div>
        ) : (
          <div className="divide-y">
            {stock.data.map((item) => (
              <div key={item.id} className="flex items-center gap-2 px-3 py-2 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.category} · SKU: {item.sku}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold tabular-nums">{item.quantity}</p>
                  <p className="text-xs text-muted-foreground">min {item.minStock}</p>
                </div>
                <Badge className={cn("text-xs border-0 px-1.5 py-0 shrink-0", STATUS_STYLES[item.status])}>
                  {STATUS_LABEL[item.status]}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
