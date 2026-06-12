/**
 * Empty State Component
 * Reusable component for displaying empty states across the application
 */

"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  /** Icon to display */
  icon?: LucideIcon;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Custom icon/image element */
  customIcon?: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: {
    container: "py-[1.3rem]",
    icon: "h-[1.95rem] w-[1.95rem]",
    title: "text-[13px]",
    description: "text-[11px]",
  },
  md: {
    container: "py-[1.95rem]",
    icon: "h-[2.6rem] w-[2.6rem]",
    title: "text-[13px]",
    description: "text-[12px]",
  },
  lg: {
    container: "py-[2.6rem]",
    icon: "h-[3.25rem] w-[3.25rem]",
    title: "text-[14px]",
    description: "text-[13px]",
  },
};

/**
 * Empty State Component
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={PackageOpen}
 *   title="No products found"
 *   description="Try adjusting your filters or search terms"
 *   action={{
 *     label: "Clear Filters",
 *     onClick: handleClearFilters
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  customIcon,
  className,
  size = "md",
}: EmptyStateProps) {
  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center animate-fade-in-up",
        styles.container,
        className
      )}
    >
      {/* Icon */}
      {customIcon || (Icon && (
        <div className="mb-[0.65rem] text-muted-foreground/50 animate-scale-in">
          <Icon className={styles.icon} strokeWidth={1.5} />
        </div>
      ))}

      {/* Title */}
      <h3 className={cn("font-semibold text-foreground mb-[0.325rem]", styles.title)}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={cn("text-muted-foreground max-w-md mb-[0.975rem]", styles.description)}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-[0.4875rem]">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
