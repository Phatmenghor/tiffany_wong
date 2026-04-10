"use client";

import { cn } from "@/lib/utils";

/**
 * Skeleton Loader Component
 * Generic skeleton/placeholder for loading states
 */

interface SkeletonProps {
  className?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function Skeleton({ className, isLoading = true, children }: SkeletonProps) {
  if (!isLoading && children) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200 rounded",
        className
      )}
    />
  );
}

/**
 * Banner Skeleton Loader
 */
export function BannerSkeleton() {
  return (
    <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden">
      <Skeleton className="w-full h-full" />
    </div>
  );
}

/**
 * Product Card Skeleton Loader
 */
export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      {/* Image skeleton */}
      <Skeleton className="w-full h-48 rounded-lg" />

      {/* Title skeleton */}
      <Skeleton className="w-4/5 h-4 rounded" />

      {/* Description skeleton */}
      <div className="space-y-2">
        <Skeleton className="w-full h-3 rounded" />
        <Skeleton className="w-3/4 h-3 rounded" />
      </div>

      {/* Price skeleton */}
      <Skeleton className="w-1/3 h-5 rounded" />
    </div>
  );
}

/**
 * Product Grid Skeleton Loader
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Category Card Skeleton Loader
 */
export function CategoryCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="w-full h-24 rounded-lg" />
      <Skeleton className="w-3/4 h-4 rounded" />
    </div>
  );
}

/**
 * Category List Skeleton Loader
 */
export function CategoryListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Navbar Skeleton Loader
 */
export function NavbarSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 h-16">
      {/* Logo skeleton */}
      <Skeleton className="w-10 h-10 rounded" />

      {/* Nav items skeleton */}
      <div className="hidden md:flex gap-6 flex-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-20 h-4 rounded" />
        ))}
      </div>

      {/* Right side buttons skeleton */}
      <div className="flex gap-2">
        <Skeleton className="w-10 h-10 rounded" />
        <Skeleton className="w-10 h-10 rounded" />
      </div>
    </div>
  );
}

/**
 * Footer Skeleton Loader
 */
export function FooterSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="w-1/2 h-4 rounded" />
          <Skeleton className="w-full h-3 rounded" />
          <Skeleton className="w-4/5 h-3 rounded" />
          <Skeleton className="w-3/4 h-3 rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * Text Line Skeleton Loader
 */
export function TextLineSkeleton({ lines = 1 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="w-full h-4 rounded" />
      ))}
    </div>
  );
}

/**
 * Table Skeleton Loader
 */
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-2">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="flex-1 h-10 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}
