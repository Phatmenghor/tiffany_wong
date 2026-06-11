"use client";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/utils/common/currency-format";
import { ChartSkeleton } from "./chart-skeleton";
import type { DashboardPaymentsResponse } from "@/redux/features/dashboard/store/models/response/dashboard-response";

const COLORS: Record<string, string> = {
  CASH: "hsl(var(--chart-1))",
  BANK_TRANSFER: "hsl(var(--chart-2))",
  ONLINE: "hsl(var(--chart-3))",
};

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold">{payload[0].name}</p>
      <p className="text-primary">{formatCurrency(payload[0].value)}</p>
      <p className="text-muted-foreground">{payload[0].payload.percentage?.toFixed(1)}%</p>
    </div>
  );
}

export function PaymentMethodsCard({ payments, loading }: { payments: DashboardPaymentsResponse | null; loading: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs">Payment Methods</CardTitle>
        <CardDescription className="text-xs">Revenue by payment type</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <ChartSkeleton height={240} /> : !payments?.data?.length ? (
          <div className="h-[240px] flex items-center justify-center text-muted-foreground text-xs">No payment data</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={payments.data} dataKey="amount" nameKey="method" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {payments.data.map((item, i) => (
                    <Cell key={item.method} fill={COLORS[item.method] ?? `hsl(var(--chart-${(i % 5) + 1}))`} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend iconSize={8} iconType="circle" formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-1 space-y-1">
              {payments.data.map((item, i) => (
                <div key={item.method} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: COLORS[item.method] ?? `hsl(var(--chart-${(i % 5) + 1}))` }} />
                    <span className="text-muted-foreground">{item.method}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-foreground tabular-nums">{item.percentage?.toFixed(0)}%</span>
                    <span className="ml-1 text-xs text-muted-foreground tabular-nums">{formatCurrency(item.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
