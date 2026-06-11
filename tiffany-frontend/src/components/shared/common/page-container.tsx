import { cn } from "@/lib/utils";
import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/**
 * PageContainer - Reusable container component for consistent width across all pages
 * Ensures navbar and body content have the same max-width for better UI/UX
 *
 * @param children - Content to be wrapped
 * @param className - Additional Tailwind classes
 * @param as - HTML element to render (default: "div")
 */
export const PageContainer = ({
  children,
  className,
  as: Component = "div",
}: PageContainerProps) => {
  return (
    <Component
      className={cn("max-w-7xl mx-auto px-[0.65rem] sm:px-[0.975rem] lg:px-[1.3rem]", className)}
    >
      {children}
    </Component>
  );
};
