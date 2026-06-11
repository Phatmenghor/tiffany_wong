"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";
import { formatCurrency } from "@/utils/common/currency-format";
import { ChartSkeleton } from "./chart-skeleton";
import type { DashboardHourlySalesResponse } from "@/redux/features/dashboard/store/models/response/dashboard-response";

function formatHour(h: number): string {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

function HourlyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded-[0.1625rem] shadow-lg px-[0.4875rem] py-[0.325rem] text-[0.4875rem] space-y-[0.1625rem]">
      <p className="font-semibold text-foreground mb-[0.1625rem]">{label}</p>
      <p className="text-primary">Revenue: <span className="font-bold">{formatCurrency(payload[0]?.value ?? 0)}</span></p>
    </div>
  );
}

export function HourlySalesCard({ hourlySales, loading, currentHour }: { hourlySales: DashboardHourlySalesResponse | null; loading: boolean; currentHour: number }) {
  const hourlyData = (hourlySales?.data ?? []).map((d) => ({ ...d, label: formatHour(d.hour), isCurrent: d.hour === currentHour }));
  const peakHour = hourlySales?.peakHour ?? 0;

  return (
    <Card>
      <CardHeader className="pb-[0.1625rem]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[0.4875rem]">Hourly Sales Pattern</CardTitle>
            <CardDescription className="text-[0.4875rem]">Today's revenue by hour (current: {formatHour(currentHour)})</CardDescription>
          </div>
          {hourlyData.length > 0 && (
            <Badge variant="outline" className="gap-[0.1625rem] text-[0.4875rem]">
              <Flame className="h-[0.325rem] w-[0.325rem] text-rose-500" />Peak: {formatHour(peakHour)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <ChartSkeleton height={200} /> : !hourlyData.length ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-[0.4875rem]">No hourly data</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" interval={2} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false}
                tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} width={40} />
              <Tooltip content={<HourlyTooltip />} />
              <Bar dataKey="revenue" radius={[3, 3, 0, 0]} maxBarSize={28}>
                {hourlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isCurrent ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.45)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
