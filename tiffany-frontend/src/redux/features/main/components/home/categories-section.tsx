/**
 * CategoriesSection Component
 * Features:
 * - Fixed 2-row grid layout across all screen sizes
 * - Responsive columns (2-6)
 * - Browse categories for quick navigation
 * - Skeleton loading placeholders
 */

import React, { useState, useEffect } from "react";
import { CategoryCard } from "@/components/shared/card/category-card";
import { CategoryGridSkeleton } from "@/components/shared/skeletons/category-card-skeleton";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import {
  SectionHeader,
  SectionWrapper,
  ViewAllButton,
} from "@/components/shared/common/section-header";

interface CategoriesSectionProps {
  categories: CategoriesResponseModel[];
  loading: boolean;
  error: string | null;
  title?: string;
}

/** Default section title for categories */
const DEFAULT_TITLE = "Shop by Category";
const DEFAULT_SUBTITLE = "Browse products by category";

/**
 * Memoized component to prevent unnecessary re-renders
 * Only re-renders when props actually change (categories, loading, error, title)
 */
const CategoriesSectionComponent = ({
  categories,
  loading,
  error,
  title = DEFAULT_TITLE,
}: CategoriesSectionProps) => {
  // Display all categories - no limit
  const displayCategories = categories || [];

  // Loading state - show skeleton placeholders
  if (loading) {
    return (
      <SectionWrapper>
        <SectionHeader
          title={title}
          subtitle={DEFAULT_SUBTITLE}
        />
        <CategoryGridSkeleton count={12} />
      </SectionWrapper>
    );
  }

  // Error or empty state - don't show section
  if (error || !displayCategories || displayCategories.length === 0) {
    if (error) {
      console.error("CategoriesSection error:", error);
    }
    return null;
  }

  // Content state with categories
  return (
    <SectionWrapper>
      <SectionHeader
        title={title}
        subtitle={DEFAULT_SUBTITLE}
      />

      {/* Responsive Category Grid: 2 cols (mobile) to 6 cols (desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {displayCategories.map((category) => (
          <CategoryCard
            key={`category-${category.id}`}
            category={category}
          />
        ))}
      </div>

      {/* Show "View All" button - always display for categories */}
      <ViewAllButton href="/categories" text="View All Categories" />
    </SectionWrapper>
  );
};

/**
 * Export memoized component
 * Prevents re-renders when parent updates but props remain the same
 */
export const CategoriesSection = React.memo(CategoriesSectionComponent);
