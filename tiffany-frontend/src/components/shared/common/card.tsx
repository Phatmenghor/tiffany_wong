import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Tighter padding for dense cards. Default uses comfortable native spacing. */
  compact?: boolean;
  as?: React.ElementType;
}

/**
 * Card — the canonical native "surface" used across public pages.
 *
 * Locks in one consistent look (radius, border, padding, subtle shadow) so
 * pages stop hand-rolling `bg-card border rounded-[…] p-[…]` strings that
 * drift apart over time. Use this for every grouped section on a page.
 */
export function Card({
  children,
  className,
  compact = false,
  as: Component = "div",
}: CardProps) {
  return (
    <Component
      className={cn(
        "bg-card border border-border/70 rounded-[0.65rem] shadow-sm",
        compact ? "p-[0.65rem]" : "p-[0.8125rem]",
        className
      )}
    >
      {children}
    </Component>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  /** Optional content rendered on the right (count pill, action, etc.) */
  right?: React.ReactNode;
}

/**
 * CardTitle — consistent heading row inside a Card. Native apps keep section
 * titles compact and bold with optional trailing metadata on the right.
 */
export function CardTitle({ children, className, right }: CardTitleProps) {
  return (
    <div className="flex items-center justify-between gap-[0.4875rem] mb-[0.65rem]">
      <h2 className={cn("text-[13px] font-bold leading-tight", className)}>
        {children}
      </h2>
      {right}
    </div>
  );
}
