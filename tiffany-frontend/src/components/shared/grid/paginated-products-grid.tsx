/**
 * PaginatedProductsGrid - Reusable infinite scroll component
 * Features:
 * - Infinite scroll pagination with smart debounce
 * - Natural scroll behavior (no auto-scroll, user scrolls to see new products)
 * - Smooth fade-in animations for new products
 * - Responsive grid (2-6 columns)
 * - Skeleton loaders during pagination
 * - Works on any page (Home, Products, Categories, etc.)
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductCardSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { usePaginationLoadMore } from "@/hooks/use-pagination-load-more";
import { Loader2 } from "lucide-react";

interface PaginatedProductsGridProps {
  products: ProductDetailResponseModel[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  isInitialLoading?: boolean;
  className?: string;
  sectionKey?: string; // Unique section identifier (e.g., "home", "products", "promo")
}

const PaginatedProductsGridComponent = ({
  products,
  loading,
  hasMore,
  onLoadMore,
  isInitialLoading = false,
  className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[0.4875rem] sm:gap-[0.65rem]",
  sectionKey = "product", // Default section identifier
}: PaginatedProductsGridProps) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [paginationSkeletonCount, setPaginationSkeletonCount] = useState(6);

  const handleLoadMoreWithScroll = useCallback(() => {
    onLoadMore();
  }, [onLoadMore]);

  // Smart pagination with debounce
  const { handleLoadMore } = usePaginationLoadMore(
    handleLoadMoreWithScroll,
    hasMore && !loading,
    [hasMore, loading, handleLoadMoreWithScroll]
  );

  // Calculate skeleton count based on screen size
  const calculateSkeletonCount = useCallback(() => {
    const width = window.innerWidth;
    if (width < 640) setPaginationSkeletonCount(2);
    else if (width < 768) setPaginationSkeletonCount(3);
    else if (width < 1024) setPaginationSkeletonCount(4);
    else if (width < 1280) setPaginationSkeletonCount(5);
    else setPaginationSkeletonCount(6);
  }, []);

  // Handle window resize
  useEffect(() => {
    calculateSkeletonCount();
    window.addEventListener("resize", calculateSkeletonCount);
    return () => window.removeEventListener("resize", calculateSkeletonCount);
  }, [calculateSkeletonCount]);


  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || !sentinelRef.current) {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "400px" }
    );

    observerRef.current = observer;
    observer.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [hasMore, handleLoadMore]);

  // Initial loading - show skeleton grid
  if (isInitialLoading) {
    return (
      <div className={className}>
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={`skeleton-initial-${i}`} />
        ))}
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef}>
      <div className={className}>
        {products.map((product, index) => {
          const uniqueKey = `${sectionKey}-${product.id}-${index}`;
          return (
            <div key={uniqueKey} data-product-key={`product-${product.id}`}>
              <ProductCard product={product} />
            </div>
          );
        })}

        {/* Skeleton loaders ALWAYS show while hasMore: true - never hide */}
        {hasMore &&
          Array.from({ length: paginationSkeletonCount }).map((_, i) => (
            <div
              key={`skeleton-default-${i}`}
            >
              <ProductCardSkeleton />
            </div>
          ))}

        {/* Loading spinner ALWAYS show while hasMore: true - never hide */}
        {hasMore && (
          <div className="col-span-full flex flex-col items-center justify-center py-[1.3rem]">
            <Loader2 className="h-[0.975rem] w-[0.975rem] animate-spin text-primary mb-[0.325rem]" />
            <p className="text-[11px] sm:text-[11px] text-muted-foreground">
              Loading more products...
            </p>
          </div>
        )}

        {/* Sentinel element for scroll detection */}
        {hasMore && !loading && (
          <div
            ref={sentinelRef}
            className="h-[1.625rem]"
            aria-label="Load more products trigger"
          />
        )}
      </div>
    </div>
  );
};

export const PaginatedProductsGrid = React.memo(
  PaginatedProductsGridComponent
);
