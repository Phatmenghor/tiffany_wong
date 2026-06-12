/**
 * PromotionsSection Component
 * Features:
 * - Fixed 4-row grid layout across all screen sizes
 * - Responsive columns (2-6)
 * - Attractive gradient background with decorative blur effect
 * - View All button for additional promotions
 * - Skeleton loading placeholders
 */

import React from "react";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductGridSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { Flame } from "lucide-react";
import {
  SectionWrapper,
  ViewAllButton,
} from "@/components/shared/common/section-header";

interface PromotionsSectionProps {
  products: ProductDetailResponseModel[];
  loading: boolean;
  error: string | null;
  title?: string;
}

/** Default section title for promotions */
const DEFAULT_TITLE = "Hot Deals & Promotions";

/**
 * Memoized component to prevent unnecessary re-renders
 * Only re-renders when props actually change (products, loading, error, title)
 */
const PromotionsSectionComponent = ({
  products,
  loading,
  error,
  title = DEFAULT_TITLE,
}: PromotionsSectionProps) => {
  // Show up to 12 promotions; link to the full list only when there are more
  const PROMOTION_LIMIT = 12;
  const displayProducts = products?.slice(0, PROMOTION_LIMIT) || [];
  const hasMorePromotions = (products?.length || 0) > PROMOTION_LIMIT;

  /**
   * Header Component - Reusable for both loading and content states
   * Features: gradient background, decorative blur, responsive sizing
   */
  const PromotionHeader = ({ showDecoration = false }) => (
    <div className="relative overflow-hidden rounded-[0.65rem] bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-[0.65rem] sm:p-[0.975rem] md:p-[1.3rem] mb-[0.975rem] shadow-sm">
      {/* Decorative blur effect - only on content view */}
      {showDecoration && (
        <div className="absolute top-0 right-0 w-[5.2rem] h-[5.2rem] sm:w-[10.4rem] sm:h-[10.4rem] bg-gradient-to-br from-red-200/20 to-orange-200/20 rounded-full blur-3xl" />
      )}

      <div className="relative">
        <h2 className="text-[13px] sm:text-[14px] md:text-[1.21875rem] font-bold tracking-tight flex items-center gap-[0.325rem] mb-[0.325rem]">
          <Flame
            className="h-[0.8125rem] w-[0.8125rem] sm:h-[0.975rem] sm:w-[0.975rem] md:h-[1.1375rem] md:w-[1.1375rem] text-red-500 flex-shrink-0"
            aria-label="Hot deals icon"
          />
          {title}
        </h2>
        <p className="text-muted-foreground text-[11px] sm:text-[11px]">
          Limited time offers - Don't miss out! 🎁
        </p>
      </div>
    </div>
  );

  // Loading state - show skeleton placeholders
  if (loading) {
    return (
      <SectionWrapper>
        <PromotionHeader showDecoration={false} />
        <ProductGridSkeleton count={PROMOTION_LIMIT} />
      </SectionWrapper>
    );
  }

  // Error or empty state - don't show section
  if (error || !displayProducts || displayProducts.length === 0) {
    if (error) {
      console.error("PromotionsSection error:", error);
    }
    return null;
  }

  // Content state with products and decoration
  return (
    <SectionWrapper>
      <PromotionHeader showDecoration={true} />

      {/* Responsive Product Grid: 2 cols (mobile) to 6 cols (desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[0.4875rem] sm:gap-[0.65rem]">
        {displayProducts.map((product) => (
          <ProductCard
            key={`promotion-product-${product.id}`}
            product={product}
          />
        ))}
      </div>

      {/* Show "View More" only when there are more than the limit */}
      {hasMorePromotions && (
        <ViewAllButton href="/promotions" text="View More Promotions" />
      )}
    </SectionWrapper>
  );
};

/**
 * Export memoized component
 * Prevents re-renders when parent updates but props remain the same
 */
export const PromotionsSection = React.memo(PromotionsSectionComponent);
