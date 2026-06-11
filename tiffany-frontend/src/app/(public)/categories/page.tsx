"use client";

import { useEffect } from "react";
import { usePublicCategoriesState } from "@/redux/features/main/store/state/public-categories-state";
import { LayoutGrid } from "lucide-react";
import { CategoryCard } from "@/components/shared/card/category-card";
import { CategoryCardSkeleton } from "@/components/shared/skeletons/category-card-skeleton";
import { useSkeletonCount, SkeletonPresets } from "@/hooks/use-skeleton-count";
import { EmptyState } from "@/components/shared/empty-state/empty-state";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";

export default function CategoriesPage() {
  const {
    categories,
    isInitialLoading,
    fetchCategories,
  } = usePublicCategoriesState();

  const skeletonCount = useSkeletonCount(SkeletonPresets.categoryGrid);

  useEffect(() => {
    // Fetch all categories without pagination
    fetchCategories({ status: "ACTIVE" });
  }, [fetchCategories]);

  return (
    <div className="min-h-screen bg-background">
      <PageContainer className="py-4 sm:py-8">
        <PageHeader
          title="Categories"
          icon={LayoutGrid}
          count={categories.length}
          subtitle={
            isInitialLoading
              ? "Loading categories..."
              : categories.length > 0
              ? `${categories.length} categories available`
              : "Browse all categories"
          }
        />

        {/* Initial Loading */}
        {isInitialLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isInitialLoading && categories.length === 0 && (
          <EmptyState
            icon={LayoutGrid}
            title="No categories found"
            description="There are no categories available at this time"
            size="lg"
          />
        )}

        {/* Categories Grid */}
        {!isInitialLoading && categories.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
