"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/shared/common/page-container";

export function ProductDetailSkeleton() {
  return (
    <PageContainer className="py-4 sm:py-6">
      <Skeleton className="h-8 w-16 mb-5 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 lg:gap-10">
        {/* Left: vertical thumbs + main image */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1.5 w-[60px]">
            <Skeleton className="h-6 w-6 rounded-lg" />
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-[52px] h-[52px] rounded-xl" />
            ))}
            <Skeleton className="h-6 w-6 rounded-lg" />
          </div>
          <Skeleton className="flex-1 aspect-square rounded-2xl" />
        </div>

        {/* Right: info + actions */}
        <div className="space-y-5 pt-2">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-9 w-4/5 rounded-lg" />
          <Skeleton className="h-12 w-44 rounded-lg" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-24 rounded" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-20 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-32 rounded-lg ml-auto" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
