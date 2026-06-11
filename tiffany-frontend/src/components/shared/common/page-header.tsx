import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Numeric count shown as a pill next to the title */
  count?: number;
  /** Label after count, e.g. "items", "products" */
  countLabel?: string;
  /** Optional content rendered on the right side (buttons, etc.) */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Sticky page-level header used consistently across all public pages.
 * Sticks below the Navbar (top-[2.6rem]) with a frosted backdrop.
 */
export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  count,
  countLabel = "items",
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-[0.325rem] sm:gap-[0.4875rem]",
        "py-[0.4875rem] sm:py-[0.65rem] mb-[0.65rem] sm:mb-[0.975rem] border-b",
        className
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-[0.325rem]">
          {Icon && <Icon className="h-[0.8125rem] w-[0.8125rem] text-primary shrink-0" />}
          <h1 className="text-[14px] font-bold truncate">{title}</h1>
          {count !== undefined && count > 0 && (
            <span className="shrink-0 text-[10px] font-semibold bg-muted text-muted-foreground px-[0.325rem] py-[0.08125rem] rounded-full">
              {count.toLocaleString()}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground mt-[0.08125rem] truncate">
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div className="shrink-0 flex items-center gap-[0.325rem]">{actions}</div>}
    </div>
  );
}
