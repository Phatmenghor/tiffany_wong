import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
}

export const SectionHeader = ({
  title,
  subtitle,
  icon: Icon,
  className,
}: SectionHeaderProps) => {
  return (
    <div className={cn("mb-[0.65rem] sm:mb-[0.975rem]", className)}>
      <h2 className="text-[0.8125rem] sm:text-[0.975rem] md:text-[1.21875rem] font-bold tracking-tight flex items-center gap-[0.325rem]">
        {Icon && <Icon className="h-[0.8125rem] w-[0.8125rem] sm:h-[0.975rem] sm:w-[0.975rem] md:h-[1.1375rem] md:w-[1.1375rem] text-primary" />}
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-[0.4875rem] sm:text-[0.56875rem] mt-[0.1625rem]">{subtitle}</p>
      )}
    </div>
  );
};

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionWrapper = ({
  children,
  className,
}: SectionWrapperProps) => {
  return <section className={cn("mb-[1.3rem] sm:mb-[1.95rem]", className)}>{children}</section>;
};

interface ViewAllButtonProps {
  href: string;
  text?: string;
  className?: string;
}

export const ViewAllButton = ({
  href,
  text = "View All Products",
  className,
}: ViewAllButtonProps) => {
  return (
    <div className={cn("flex justify-center mt-[0.975rem] sm:mt-[1.3rem]", className)}>
      <Link href={href}>
        <Button
          size="default"
          variant="outline"
          className="gap-[0.325rem] group border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all px-[0.975rem] sm:px-[1.3rem]"
        >
          {text}
          <ArrowRight className="h-[0.65rem] w-[0.65rem] sm:h-[0.8125rem] sm:w-[0.8125rem] transition-transform group-hover:translate-x-[0.1625rem]" />
        </Button>
      </Link>
    </div>
  );
};
