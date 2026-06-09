"use client";
import { ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/common/currency-format";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { DashboardOrdersResponse } from "@/redux/features/dashboard/store/models/response/dashboard-response";

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  CANCELLED: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
  PROCESSING: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400",
};

function formatDate(val: string | null): string {
  if (!val) return "—";
  try { return format(parseISO(val), "MMM d, h:mm a"); } catch { return val; }
}

export function RecentOrdersCard({ orders, loading }: { orders: DashboardOrdersResponse | null; loading: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xs">Recent Orders</CardTitle>
            <CardDescription className="text-xs">Latest transactions this period</CardDescription>
          </div>
          {orders && (
            <Badge variant="outline" className="text-xs gap-1">
              <ShoppingBag className="h-2.5 w-2.5" />{orders.totalElements} total
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-3 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-2.5 w-20" />
                  <Skeleton className="h-2 w-14" />
                </div>
                <Skeleton className="h-2.5 w-12" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : !orders?.data?.length ? (
          <div className="flex flex-col items-center justify-center py-7 text-muted-foreground gap-1">
            <ShoppingBag className="h-5 w-5 opacity-30" />
            <p className="text-xs">No orders this period</p>
          </div>
        ) : (
          <div className="divide-y">
            {orders.data.map((order) => (
              <div key={order.id} className="flex items-center gap-2 px-3 py-2 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {order.orderCode}
                    {order.customerName && (
                      <span className="text-muted-foreground font-normal"> · {order.customerName}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.itemCount} item{order.itemCount !== 1 ? "s" : ""} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold tabular-nums">{formatCurrency(order.totalAmount)}</p>
                  <p className="text-xs text-muted-foreground">{order.paymentMethod}</p>
                </div>
                <Badge className={cn("text-xs border-0 px-1.5 py-0 shrink-0", STATUS_STYLES[order.status] ?? "bg-muted text-muted-foreground")}>
                  {order.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
