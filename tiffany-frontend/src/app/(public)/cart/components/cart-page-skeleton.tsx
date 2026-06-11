import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/shared/common/page-container";
import { CartItemSkeleton } from "./cart-item-skeleton";

export function CartPageSkeleton() {
  return (
    <PageContainer className="py-[0.65rem] sm:py-[1.3rem] pb-[6.5rem] sm:pb-[1.3rem]">
      <div className="mb-[0.975rem] space-y-[0.325rem]">
        <Skeleton className="h-[1.3rem] w-[7.8rem]" />
        <Skeleton className="h-[0.8125rem] w-[10.4rem]" />
      </div>
      <div className="grid lg:grid-cols-3 gap-[0.65rem] sm:gap-[0.975rem]">
        <div className="lg:col-span-2 space-y-[0.4875rem]">
          {[1, 2, 3, 4, 5].map((i) => (
            <CartItemSkeleton key={i} />
          ))}
        </div>
        <div className="hidden lg:block">
          <Skeleton className="h-[10.4rem] w-full rounded-[0.65rem]" />
        </div>
      </div>
    </PageContainer>
  );
}
