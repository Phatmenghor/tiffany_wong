"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/shared/common/page-container";

export function ProductDetailSkeleton() {
  return (
    <PageContainer className="py-[0.65rem] sm:py-[0.975rem]">
      <Skeleton className="h-[1.3rem] w-[2.6rem] mb-[0.8125rem] rounded-[0.4875rem]" />
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-[1.3rem] lg:gap-[1.625rem]">
        {/* Left: vertical thumbs + main image */}
        <div className="flex gap-[0.4875rem]">
          <div className="flex flex-col items-center gap-[0.24375rem] w-[60px]">
            <Skeleton className="h-[0.975rem] w-[0.975rem] rounded-lg" />
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-[52px] h-[52px] rounded-[0.4875rem]" />
            ))}
            <Skeleton className="h-[0.975rem] w-[0.975rem] rounded-lg" />
          </div>
          <Skeleton className="flex-1 aspect-square rounded-[0.65rem]" />
        </div>

        {/* Right: info + actions */}
        <div className="space-y-[0.8125rem] pt-[0.325rem]">
          <div className="flex gap-[0.325rem]">
            <Skeleton className="h-[0.975rem] w-[3.9rem] rounded-full" />
            <Skeleton className="h-[0.975rem] w-[2.6rem] rounded-full" />
            <Skeleton className="h-[0.975rem] w-[2.6rem] rounded-full" />
          </div>
          <Skeleton className="h-[1.4625rem] w-4/5 rounded-lg" />
          <Skeleton className="h-[1.95rem] w-[7.15rem] rounded-lg" />
          <Skeleton className="h-[2.275rem] w-full rounded-[0.4875rem]" />
          <div className="space-y-[0.325rem]">
            <Skeleton className="h-[0.8125rem] w-[3.9rem] rounded-[0.1625rem]" />
            <div className="flex gap-[0.325rem]">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[2.6rem] w-[3.25rem] rounded-[0.4875rem]" />
              ))}
            </div>
          </div>
          <div className="flex gap-[0.325rem] items-center">
            <Skeleton className="h-[1.3rem] w-[3.9rem] rounded-lg" />
            <Skeleton className="h-[1.3rem] w-[3.9rem] rounded-lg" />
            <Skeleton className="h-[1.3rem] w-[5.2rem] rounded-lg ml-auto" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="grid grid-cols-2 gap-[0.4875rem]">
            <Skeleton className="h-[1.7875rem] rounded-[0.4875rem]" />
            <Skeleton className="h-[1.7875rem] rounded-[0.4875rem]" />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
