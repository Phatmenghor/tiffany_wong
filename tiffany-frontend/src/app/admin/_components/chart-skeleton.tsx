"use client";
import { BarChart2 } from "lucide-react";

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="flex items-center justify-center bg-muted/20 rounded-[0.1625rem]" style={{ height }}>
      <div className="flex flex-col items-center gap-[0.1625rem] text-muted-foreground">
        <BarChart2 className="h-[0.8125rem] w-[0.8125rem] opacity-30" />
        <span className="text-[0.4875rem]">Loading chart…</span>
      </div>
    </div>
  );
}
