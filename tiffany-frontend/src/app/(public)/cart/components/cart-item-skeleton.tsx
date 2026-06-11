import { Skeleton } from "@/components/ui/skeleton";

export function CartItemSkeleton() {
  return (
    <div className="bg-card border rounded-[0.65rem] p-[0.4875rem] sm:p-[0.65rem]">
      <div className="flex gap-[0.4875rem]">
        <Skeleton className="w-[72px] h-[72px] rounded-[0.4875rem] flex-shrink-0" />
        <div className="flex-1 space-y-[0.4875rem]">
          <Skeleton className="h-[0.8125rem] w-3/4" />
          <Skeleton className="h-[0.65rem] w-1/2" />
          <div className="flex gap-[0.325rem]">
            <Skeleton className="h-[1.3rem] w-[3.9rem]" />
            <Skeleton className="h-[1.3rem] w-[3.25rem]" />
          </div>
        </div>
      </div>
    </div>
  );
}
