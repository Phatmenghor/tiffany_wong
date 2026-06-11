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
        <h1 className="text-sm font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{today}</p>
      </div>
      <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={onRefresh}>
        <RefreshCw className="h-3.5 w-3.5" />
        Refresh
      </Button>
    </div>
  );
}
