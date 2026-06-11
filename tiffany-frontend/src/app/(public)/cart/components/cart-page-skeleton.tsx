import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/shared/common/page-container";
import { CartItemSkeleton } from "./cart-item-skeleton";

export function CartPageSkeleton() {
  return (
    <PageContainer className="py-4 sm:py-8 pb-40 sm:pb-8">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <CartItemSkeleton key={i} />
          ))}
        </div>
        <div className="hidden lg:block">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </PageContainer>
  );
}
