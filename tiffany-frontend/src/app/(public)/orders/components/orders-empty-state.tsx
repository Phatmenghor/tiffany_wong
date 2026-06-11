import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";

interface OrdersEmptyStateProps {
  hasFilters: boolean;
}

export function OrdersEmptyState({ hasFilters }: OrdersEmptyStateProps) {
  const router = useRouter();

  return (
    <div className="rounded-[0.65rem] border border-dashed border-border bg-card p-[1.95rem] text-center">
      <div className="w-[2.6rem] h-[2.6rem] rounded-[0.65rem] bg-primary/10 flex items-center justify-center mx-auto mb-[0.65rem]">
        <ShoppingBag className="h-[1.3rem] w-[1.3rem] text-primary" />
      </div>
      <h3 className="text-[0.73125rem] font-semibold text-foreground mb-[0.325rem]">
        {hasFilters ? "No Orders Found" : "No Orders Yet"}
      </h3>
      <p className="text-muted-foreground mb-[0.975rem]">
        {hasFilters
          ? "No orders found with the selected filters. Try a different filter."
          : "You haven't placed any orders yet. Start shopping now!"}
      </p>
      <CustomButton
        onClick={() => router.push("/menu")}
        className="rounded-[0.4875rem] h-[1.7875rem] px-[0.975rem]"
      >
        Browse Menu
      </CustomButton>
    </div>
  );
}
