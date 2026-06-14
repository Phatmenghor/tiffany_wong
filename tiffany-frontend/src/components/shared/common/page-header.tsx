import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Numeric count shown as a pill next to the title */
  count?: number;
  /** Label after count, e.g. "items", "products" */
  countLabel?: string;
  /** Optional content rendered on the right side (buttons, etc.) */
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  count,
  countLabel = "items",
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-[0.4875rem]",
        "py-[0.65rem] mb-[0.65rem] sm:mb-[0.975rem] border-b",
        className
      )}
    >
      {/* Left: title + count */}
      <div className="min-w-0 flex items-center gap-[0.4875rem]">
        <h1 className="text-[15px] sm:text-[14px] font-bold truncate leading-tight">{title}</h1>
        {count !== undefined && count > 0 && (
          <span className="shrink-0 text-[11px] sm:text-[10px] font-semibold bg-muted text-muted-foreground px-[0.4875rem] py-[0.08125rem] rounded-full">
            {count.toLocaleString()} {countLabel}
          </span>
        )}
      </div>

      {/* Right: actions */}
      {actions && (
        <div className="shrink-0 flex items-center gap-[0.325rem]">{actions}</div>
      )}
    </div>
  );
}
