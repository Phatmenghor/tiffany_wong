"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/shared/common/page-container";

export function ProductDetailSkeleton() {
  return (
    <PageContainer className="py-6">
      <Skeleton className="h-9 w-20 mb-5 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-[9fr_11fr] gap-10">
        <div className="space-y-3">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <div className="flex gap-2.5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-xl flex-shrink-0" />
            ))}
          </div>
        </div>
        <div className="space-y-5 pt-2">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-9 w-4/5 rounded-lg" />
          <Skeleton className="h-12 w-40 rounded-lg" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-9 w-24 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28 rounded" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="flex gap-3">
            <Skeleton className="flex-1 h-11 rounded-xl" />
            <Skeleton className="flex-1 h-11 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
