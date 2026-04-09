/**
 * Public Pages Loading State
 * Shows while public pages are loading (banners, products, categories)
 */

import { BannerSkeleton, ProductGridSkeleton, CategoryListSkeleton } from "@/components/shared/loading";

export default function PublicLoading() {
  return (
    <div className="flex flex-col gap-8 py-8">
      {/* Hero Banner Loading */}
      <div className="px-4">
        <BannerSkeleton />
      </div>

      {/* Featured Categories */}
      <div className="px-4">
        <div className="space-y-3">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <CategoryListSkeleton count={6} />
        </div>
      </div>

      {/* Featured Products */}
      <div className="px-4">
        <div className="space-y-3">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </div>
  );
}
