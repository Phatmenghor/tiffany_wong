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
    <div className="bg-popover border rounded-[0.1625rem] shadow-lg px-[0.4875rem] py-[0.325rem] text-[0.4875rem]">
      <p className="font-semibold">{payload[0].name}</p>
      <p className="text-primary">{formatCurrency(payload[0].value)}</p>
      <p className="text-muted-foreground">{payload[0].payload.percentage?.toFixed(1)}%</p>
    </div>
  );
}

export function PaymentMethodsCard({ payments, loading }: { payments: DashboardPaymentsResponse | null; loading: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-[0.1625rem]">
        <CardTitle className="text-[0.4875rem]">Payment Methods</CardTitle>
        <CardDescription className="text-[0.4875rem]">Revenue by payment type</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <ChartSkeleton height={240} /> : !payments?.data?.length ? (
          <div className="h-[240px] flex items-center justify-center text-muted-foreground text-[0.4875rem]">No payment data</div>
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
                <Legend iconSize={8} iconType="circle" formatter={(v) => <span className="text-[0.4875rem] text-muted-foreground">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-[0.1625rem] space-y-[0.1625rem]">
              {payments.data.map((item, i) => (
                <div key={item.method} className="flex items-center justify-between text-[0.4875rem]">
                  <div className="flex items-center gap-[0.1625rem]">
                    <div className="w-[0.1625rem] h-[0.1625rem] rounded-full shrink-0" style={{ backgroundColor: COLORS[item.method] ?? `hsl(var(--chart-${(i % 5) + 1}))` }} />
                    <span className="text-muted-foreground">{item.method}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-foreground tabular-nums">{item.percentage?.toFixed(0)}%</span>
                    <span className="ml-[0.1625rem] text-[0.4875rem] text-muted-foreground tabular-nums">{formatCurrency(item.amount)}</span>
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
