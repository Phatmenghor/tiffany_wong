/**
 * Global Loading State
 * Shows while the page is loading (using React Suspense)
 * Automatically replaced with actual content when ready
 */

import { BannerSkeleton, ProductGridSkeleton, CategoryListSkeleton } from "@/components/shared/loading";

export default function RootLoading() {
  return (
    <div className="flex flex-col gap-8 py-8">
      {/* Banner Loading */}
      <div className="px-4">
        <BannerSkeleton />
      </div>

      {/* Categories Loading */}
      <div className="px-4">
        <div className="space-y-3">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <CategoryListSkeleton count={6} />
        </div>
      </div>

      {/* Products Loading */}
      <div className="px-4">
        <div className="space-y-3">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </div>
  );
}
