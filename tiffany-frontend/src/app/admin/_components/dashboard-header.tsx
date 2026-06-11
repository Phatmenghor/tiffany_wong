"use client";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  today: string;
  onRefresh: () => void;
}

export function DashboardHeader({ today, onRefresh }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-[0.56875rem] font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-[0.4875rem] text-muted-foreground mt-[0.08125rem]">{today}</p>
      </div>
      <Button variant="outline" size="sm" className="gap-[0.24375rem] h-[1.3rem]" onClick={onRefresh}>
        <RefreshCw className="h-[0.56875rem] w-[0.56875rem]" />
        Refresh
      </Button>
    </div>
  );
}
