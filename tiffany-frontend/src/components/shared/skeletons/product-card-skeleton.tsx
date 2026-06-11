import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const ProductCardSkeleton = ({ compact = false }: { compact?: boolean }) => {
  if (compact) {
    // POS Compact Skeleton
    return (
      <div className="bg-card rounded-[0.325rem] border border-border overflow-hidden">
        {/* Image Skeleton */}
        <div className="relative aspect-square w-full bg-muted/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          {/* Badge placeholders */}
          <div className="absolute top-[0.1625rem] left-[0.1625rem]">
            <div className="h-[0.65rem] w-[1.3rem] bg-muted/50 rounded-[0.1625rem] animate-pulse" />
          </div>
          <div className="absolute -top-[0.1625rem] -right-[0.1625rem]">
            <div className="h-[0.65rem] w-[0.65rem] bg-muted/50 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Content Skeleton - Compact */}
        <div className="p-[0.1625rem] space-y-[0.1625rem]">
          {/* Price */}
          <div className="space-y-[0.08125rem]">
            <div className="h-[0.4875rem] w-[1.625rem] bg-muted/50 rounded-[0.1625rem] animate-pulse" />
            <div className="h-[0.4875rem] w-[1.95rem] bg-muted/50 rounded-[0.1625rem] animate-pulse" />
          </div>

          {/* Button */}
          <div className="h-[0.8125rem] w-full bg-muted/50 rounded-[0.1625rem] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border">
      {/* Image Skeleton - Square aspect ratio with shimmer */}
      <div className="relative aspect-square w-full bg-muted/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        {/* Badge placeholders */}
        <div className="absolute top-[0.325rem] left-[0.325rem]">
          <div className="h-[0.8125rem] w-[1.95rem] bg-muted/50 rounded-[0.1625rem] animate-pulse" />
        </div>
        <div className="absolute top-[0.325rem] right-[0.325rem]">
          <div className="h-[0.8125rem] w-[2.275rem] bg-muted/50 rounded-[0.1625rem] animate-pulse" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-[0.4875rem] space-y-[0.4875rem]">
        {/* Product Name - 2 lines with shimmer */}
        <div className="space-y-[0.325rem]">
          <div className="h-[0.65rem] w-full bg-muted/50 rounded-[0.1625rem] animate-pulse" />
          <div className="h-[0.65rem] w-3/4 bg-muted/50 rounded-[0.1625rem] animate-pulse" />
        </div>

        {/* Price Section */}
        <div className="space-y-[0.24375rem]">
          <div className="h-[0.975rem] w-[3.9rem] bg-muted/50 rounded-[0.1625rem] animate-pulse" />
          <div className="h-[0.4875rem] w-[3.25rem] bg-muted/50 rounded-[0.1625rem] animate-pulse" />
        </div>

        {/* Button */}
        <div className="h-[1.3rem] w-full bg-muted/50 rounded-[0.1625rem] animate-pulse" />
      </div>
    </Card>
  );
};

interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export const ProductGridSkeleton = ({
  count = 8,
  className,
}: ProductGridSkeletonProps) => {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-[0.4875rem] sm:gap-[0.65rem] animate-fade-in-up-stagger", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};
