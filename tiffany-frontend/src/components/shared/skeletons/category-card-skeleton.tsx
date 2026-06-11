import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const CategoryCardSkeleton = () => {
  return (
    <Card className="overflow-hidden border">
      <CardContent className="p-[0.65rem] sm:p-[0.8125rem] flex flex-col items-center justify-center space-y-[0.4875rem]">
        {/* Icon/Image Circle */}
        <div className="relative w-[2.6rem] h-[2.6rem] sm:w-[2.925rem] sm:h-[2.925rem] bg-muted/50 rounded-[0.4875rem] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>

        {/* Category Name - 2 lines */}
        <div className="w-full space-y-[0.24375rem] flex flex-col items-center">
          <div className="h-[0.4875rem] w-[3.9rem] bg-muted/50 rounded-[0.1625rem] animate-pulse" />
          <div className="h-[0.4875rem] w-[2.6rem] bg-muted/50 rounded-[0.1625rem] animate-pulse" />
        </div>

        {/* Product Count */}
        <div className="h-[0.40625rem] w-[3.25rem] bg-muted/50 rounded-[0.1625rem] animate-pulse" />
      </CardContent>
    </Card>
  );
};

interface CategoryGridSkeletonProps {
  count?: number;
  className?: string;
}

export const CategoryGridSkeleton = ({
  count = 6,
  className,
}: CategoryGridSkeletonProps) => {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[0.4875rem] sm:gap-[0.65rem]", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <CategoryCardSkeleton key={index} />
      ))}
    </div>
  );
};
