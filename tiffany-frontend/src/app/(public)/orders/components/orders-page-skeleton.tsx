import { PageContainer } from "@/components/shared/common/page-container";

export function OrdersPageSkeleton() {
  return (
    <PageContainer className="py-[1.3rem]">
      <div className="space-y-[0.65rem]">
        <div className="h-[1.95rem] bg-muted rounded-lg animate-pulse" />
        <div className="h-[1.7875rem] bg-muted rounded-lg animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border p-[0.65rem] space-y-[0.4875rem]">
            <div className="h-[0.975rem] bg-muted rounded-[0.1625rem] animate-pulse" />
            <div className="h-[0.65rem] bg-muted rounded-[0.1625rem] animate-pulse" />
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
